import { AuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import styles from "./ChatBody.module.css";
import { fetchData } from "@/utils/fetchData";
import MessageItem from "./MessageItem";
import { StoreContext } from "@/contexts/StoreContext";
import { Message } from "@/types/Message";
import usePrevious from "@/hooks/usePrevious";

function ChatBody() {
  const router = useRouter();
  const { room: roomId } = router.query;
  const { token } = useContext(AuthContext);

  const { messages, setMessages, usersById } = useContext(StoreContext);
  const [socket, setSocket] = useState<WebSocket>();
  const [changingId, setChangingId] = useState(-1);

  const preMessages = usePrevious<Message[]>(messages);
  const messagesEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // if message is added not edit or delete
    if (preMessages && preMessages.length < messages.length) {
      messagesEnd.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, preMessages]);
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "auto" });
  }, [roomId]);

  async function createMessageHandler(e: any) {
    if (socket == undefined) return;
    if (!(e.key === "Enter" && e.shiftKey === false)) return;

    e.preventDefault();

    const body = {
      room: roomId,
      content: e.target.value,
    };

    fetchData("messages/", "POST", body, token)
      .then((data) => {
        socket.send(JSON.stringify({ ...data, method: "POST" }));
      })
      .catch((err) => {
        console.log(err);
      });

    e.target.value = "";
  }

  // socket handler
  useEffect(() => {
    if (roomId == undefined) return;

    if (socket) socket.close();
    setSocket(new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomId}/`));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (socket == undefined) return;

    socket.onerror = async (e) => console.log("msgerr: ", e);

    socket.onmessage = async (e) => {
      const data = await JSON.parse(e.data);

      if (data.method === "POST") {
        setMessages((prev) => [...prev, data]);
      } else if (data.method === "EDIT") {
        setMessages((prev) =>
          prev.map((message) => (message.id == data.id ? data : message))
        );
      } else if (data.method === "DELETE") {
        setMessages((prev) => prev.filter((message) => message.id !== data.id));
      }
    };
  }, [socket, setMessages]);

  return (
    <div className={styles.container}>
      <div className={styles.messageContainer}>
        {messages?.map((message, index) => (
          <MessageItem
            key={index}
            message={message}
            changingState={[changingId, setChangingId]}
            socket={socket}
            user={usersById[message.user]}
          />
        ))}
        <div ref={messagesEnd}></div>
      </div>
      <textarea
        aria-label="Chat Area"
        onKeyDown={(e) => createMessageHandler(e)}
        autoFocus
        className={styles.chatarea}
      ></textarea>
    </div>
  );
}

export default ChatBody;
