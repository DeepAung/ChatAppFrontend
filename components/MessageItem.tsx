import Image from "next/image";

import { Message } from "@/types/Message";
import { User } from "@/types/User";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./MessageItem.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { fetchData } from "@/utils/fetchData";
import { AuthContext } from "@/contexts/AuthContext";
import Link from "next/link";

type Props = {
  message: Message;
  changingState: [number, Dispatch<SetStateAction<number>>];
  socket: WebSocket | undefined;
  user: User;
};

function MessageItem({ message, changingState, socket, user }: Props) {
  const { token, myUser } = useContext(AuthContext);

  const [changingId, setChangingId] = changingState;
  const contentRef = useRef<HTMLDivElement>(null);
  const btnList = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (changingId == message.id) {
      contentRef.current?.focus();
    }
  }, [changingId, message.id]);

  function showBtn() {
    if (myUser?.user_id != user?.id || !btnList.current) return;
    btnList.current.style.display = "flex";
  }

  function hideBtn() {
    if (myUser?.user_id != user?.id || !btnList.current) return;
    btnList.current.style.display = "none";
  }

  function toggleEdit() {
    setChangingId(changingId == message.id ? -1 : message.id);
  }

  function cancelEdit(e: any) {
    if (e.key == "Escape") setChangingId(-1);
  }

  function updateMessageHandler(e: any) {
    if (socket == undefined || !contentRef.current) return;
    if (!(e.key == "Enter" && !e.shiftKey)) return;

    const body = { ...message, content: contentRef.current.innerHTML };

    fetchData(`messages/${message.id}/`, "PATCH", body, token)
      .then((data) => socket.send(JSON.stringify({ ...data, method: "EDIT" })))
      .catch((err) => console.log(err));

    setChangingId(-1);
  }

  function deleteMessageHandler(e: any) {
    if (socket == undefined) return;

    const result = confirm("Are you sure you want to delete this message?");
    if (result) {
      fetchData(`messages/${message.id}/`, "DELETE", {}, token)
        .then((data) =>
          socket.send(JSON.stringify({ ...message, method: "DELETE" }))
        )
        .catch((err) => console.log(err));
    }
  }

  return (
    <div
      onMouseEnter={showBtn}
      onMouseLeave={hideBtn}
      className={styles.container}
    >
      {user && (
        <Link href={`/user/${user?.id}`} className={styles.img}>
          <Image
            
            src={user?.get_avatar}
            width={100}
            height={100}
            alt="profile"
          />
        </Link>
      )}

      <div>
        <Link href={`/user/${user?.id}`} className={styles.username}>
          {user?.username}
        </Link>
        <span className={styles.timeago}>{message.timeago}</span>

        {changingId == message.id ? (
          <div
            contentEditable
            suppressContentEditableWarning
            className={styles.editingContent}
            onKeyDown={(e) => {
              updateMessageHandler(e);
              cancelEdit(e);
            }}
            ref={contentRef}
          >
            {message.content}
          </div>
        ) : (
          <p className={styles.content}>{message.content}</p>
        )}
      </div>

      <div ref={btnList} className={styles.btnList}>
        <button
          title="Edit Message"
          type="button"
          onClick={toggleEdit}
          className={styles.btn}
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
        <button
          title="Delete Message"
          type="button"
          onClick={deleteMessageHandler}
          className={styles.btn}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
}

export default MessageItem;
