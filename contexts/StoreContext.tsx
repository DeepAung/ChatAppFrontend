import {
  createContext,
  useState,
  useEffect,
  FC,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";
import { useRouter } from "next/router";

import { Room } from "@/types/Room";
import { User } from "@/types/User";
import { Message } from "@/types/Message";

import { fetchData } from "@/utils/fetchData";
import { AuthContext } from "./AuthContext";

type UsersById = { [id: number]: User };

type contextType = {
  rooms: Room[];
  users: User[];
  usersById: UsersById;
  messages: Message[];
  setRooms: Dispatch<SetStateAction<Room[]>>;
  setUsers: Dispatch<SetStateAction<User[]>>;
  setUsersById: Dispatch<SetStateAction<UsersById>>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
};

const initialValue = {
  rooms: [],
  users: [],
  usersById: {},
  messages: [],
  setRooms: () => {},
  setUsers: () => {},
  setUsersById: () => {},
  setMessages: () => {},
};

export const StoreContext = createContext<contextType>(initialValue);

export const StoreProvider: FC<any> = ({ children }) => {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [usersById, setUsersById] = useState<UsersById>({});

  useEffect(() => {
    setRooms([]);
    setUsers([]);
    setMessages([]);

    let roomId = -1;
    if (router.query.room) roomId = Number(router.query.room);
    else if (router.pathname.startsWith("/room/") && router.query.id) {
      roomId = Number(router.query.id);
    }

    if (token == undefined) return;

    fetchData("rooms/", "GET", {}, token)
      .then((data) => setRooms(data))
      .catch((err) => console.log(err));

    if (roomId == -1) return;

    fetchData(`rooms/${roomId}/users/`, "GET", {}, token)
      .then((data) => setUsers(data))
      .catch((err) => console.log(err));

    fetchData(`rooms/${roomId}/messages/`, "GET", {}, token)
      .then((data) => setMessages(data))
      .catch((err) => console.log(err));
  }, [router, token]);

  useEffect(() => {
    let newValue: UsersById = {};

    for (const user of users) {
      newValue[user.id] = user;
    }

    setUsersById(newValue);
  }, [users]);

  const storeData = {
    rooms,
    setRooms,
    users,
    setUsers,
    usersById,
    setUsersById,
    messages,
    setMessages,
  };

  return (
    <StoreContext.Provider value={storeData}>{children}</StoreContext.Provider>
  );
};

export default StoreProvider;
