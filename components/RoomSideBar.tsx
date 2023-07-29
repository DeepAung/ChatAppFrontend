import { useContext, useState } from "react";

import styles from "./RoomSideBar.module.css";
import { useRouter } from "next/router";
import { StoreContext } from "@/contexts/StoreContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { fetchData } from "@/utils/fetchData";
import { AuthContext } from "@/contexts/AuthContext";

function RoomSideBar() {
  const router = useRouter();
  const { room: roomIdStr } = router.query;
  const roomId = Number(roomIdStr);

  const { token } = useContext(AuthContext);
  const { rooms } = useContext(StoreContext);
  const [error, setError] = useState("");

  async function joinRoom(e: any) {
    e.preventDefault();

    const newRoom = e.target.room.value;
    if (newRoom === "") {
      setError("");
      return;
    }

    fetchData(`rooms/${newRoom}/join/`, "POST", {}, token)
      .then((data) => router.reload())
      .catch((err) => {
        if (typeof err.data == "string") setError(err.data);
        else setError((err.error as Error).message);
        console.log(err);
      });
  }

  return (
    <div className={styles.sideBar}>
      <div className={styles.joinRoom}>
        <form onSubmit={joinRoom}>
          <input
            type="text"
            name="room"
            aria-label="Join Room"
            placeholder="Join Room"
          />
          <input type="submit" value="Join" />
        </form>

        <p className={styles.errMsg}>{error}</p>
      </div>

      {rooms?.map((room, index) => (
        <div className={styles.roomItem} key={index}>
          <span
            onClick={() => router.push(`?room=${room.id}`)}
            className={roomId == room.id ? styles.selected : ""}
          >
            {room.topic}
          </span>
          <Link href={`/room/${room.id}`} className={styles.icon}>
            <FontAwesomeIcon icon={faGear} />
          </Link>
        </div>
      ))}
    </div>
  );
}

export default RoomSideBar;
