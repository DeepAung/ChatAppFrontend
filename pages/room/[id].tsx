import { AuthContext } from "@/contexts/AuthContext";
import { fetchData } from "@/utils/fetchData";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";

import styles from "./[id].module.css";
import { Room } from "@/types/Room";
import { StoreContext } from "@/contexts/StoreContext";
import Link from "next/link";

function RoomSetting() {
  const router = useRouter();
  const { id: idStr } = router.query;
  const id = Number(idStr);

  const { token, myUser } = useContext(AuthContext);
  const { usersById } = useContext(StoreContext);

  const [room, setRoom] = useState<Room>();
  const [isEditing, setIsEditing] = useState(false);
  const [triggerUseEffect, setTriggerUseEffect] = useState(false);

  // ----------------------------------------- //

  type FieldType = {
    name: string;
    showName: string;
    value: string | undefined;
  };

  const InputField = ({ name, showName, value }: FieldType) => (
    <div className={styles.field}>
      <span>{showName}</span>
      <input
        type="text"
        name={name}
        aria-label={showName}
        placeholder={showName}
        defaultValue={value || ""}
      />
    </div>
  );

  // ----------------------------------------- //

  useEffect(() => {
    if (Number.isNaN(id) || token == undefined) return;

    fetchData(`rooms/${id}/`, "GET", {}, token)
      .then((data) => setRoom(data))
      .catch((err) => console.log(err));
  }, [id, token, triggerUseEffect]);

  async function saveEdit(e: any) {
    e.preventDefault();

    let a: HTMLSelectElement;
    const dom = e.target.participants.options;
    let participants = [];
    for (let i = 0; i < dom.length; i++) {
      if (dom[i].selected) {
        participants.push(dom[i].value);
      }
    }

    const body = {
      topic: e.target.topic.value,
      host: e.target.host.value,
      participants,
    };

    fetchData(`rooms/${room?.id}/`, "PATCH", body, token)
      .catch((err) => console.log(err))
      .finally(() => {
        setIsEditing(false);
        setTriggerUseEffect(!triggerUseEffect);
      });
  }

  async function cancelEdit(e: any) {
    setIsEditing(false);
  }

  async function deleteRoom(e: any) {
    const result = confirm("Are you sure you want to delete this room?");
    if (result) {
      fetchData(`rooms/${id}/`, "DELETE", {}, token)
        .catch((err) => console.log(err))
        .finally(() => router.push("/"));
    }
  }

  async function leaveRoom(e: any) {
    const result = confirm("Are you sure you want to leave this room?");
    if (result) {
      fetchData(`rooms/${id}/leave/`, "POST", {}, token)
        .catch((err) => console.log(err))
        .finally(() => router.push("/"));
    }
  }

  // ----------------------------------------- //

  return (
    <div className={styles.container}>
      {!isEditing ? (
        <div className={styles.info}>
          <div className={styles.section}>
            <h3>Topic</h3>
            <p>{"- " + room?.topic}</p>
          </div>

          <div className={styles.section}>
            <h3>Host</h3>
            <p className={styles.user}>
              {"- "}
              <Link href={`/user/${room?.host}`}>
                {room ? usersById[room.host]?.username : ""}
              </Link>
            </p>
          </div>

          <div className={styles.section}>
            <h3>Participants</h3>
            {room?.participants.map((userId) => (
              <p className={styles.user} key={userId}>
                {"- "}
                <Link href={`/user/${userId}`}>
                  {usersById[userId]?.username}
                </Link>
              </p>
            ))}
          </div>

          {myUser?.user_id == room?.host ? (
            <>
              <button
                className={styles.deleteBtn}
                onClick={deleteRoom}
                title="Edit"
                type="button"
              >
                Delete
              </button>
              <button
                onClick={(e) => setIsEditing(true)}
                title="Edit"
                type="button"
              >
                Edit
              </button>
            </>
          ) : (
            <button onClick={leaveRoom} title="Leave" type="button">
              Leave
            </button>
          )}
        </div>
      ) : (
        <form className={styles.info} onSubmit={saveEdit}>
          <div className={styles.wrapper}>
            <InputField name="topic" showName="Topic" value={room?.topic} />

            <div className={styles.field}>
              <span>Host</span>
              <select name="host" aria-label="Host" defaultValue={room?.host}>
                {room?.participants.map((userId) => (
                  <option key={userId} value={userId}>
                    {usersById[userId]?.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button onClick={cancelEdit} title="Cancel" type="button">
            Cancel
          </button>
          <input type="submit" value="Save" />
        </form>
      )}
    </div>
  );
}

export default RoomSetting;
