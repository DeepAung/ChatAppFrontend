import RoomSideBar from "@/components/RoomSideBar";
import UserSideBar from "@/components/UserSideBar";
import Head from "next/head";

import styles from "./index.module.css";
import ChatBody from "@/components/ChatBody";

function Home() {
  return (
    <>
      <Head>
        <title>Chat App</title>
        <meta name="description" content="A cool Chat App" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.homepage}>
        <RoomSideBar />
        <ChatBody />
        <UserSideBar />
      </div>
    </>
  );
}

export default Home;
