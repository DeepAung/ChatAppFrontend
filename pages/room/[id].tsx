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
      .catch((err) => {
        alert(JSON.stringify(err.data));
        router.push("/");
      });
  }, [router, id, token, triggerUseEffect]);

  async function saveEdit(e: any) {
    e.preventDefault();

    const participants = room?.participants.filter(
      (userId) => e.target[`participants ${userId}`].checked
    );

    const body = {
      topic: e.target.topic.value,
      host: e.target.host.value,
      participants,
    };

    fetchData(`rooms/${room?.id}/`, "PATCH", body, token)
      .then(() => {
        setIsEditing(false);
        setTriggerUseEffect(!triggerUseEffect);
      })
      .catch((err) => {
        alert(JSON.stringify(err.data));
        cancelEdit();
      });
  }

  async function cancelEdit() {
    setIsEditing(false);
  }

  async function deleteRoom() {
    const result = confirm("Are you sure you want to delete this room?");
    if (result) {
      fetchData(`rooms/${id}/`, "DELETE", {}, token)
        .then(() => router.push("/"))
        .catch((err) => alert(JSON.stringify(err.data)));
    }
  }

  async function leaveRoom() {
    const result = confirm("Are you sure you want to leave this room?");
    if (result) {
      fetchData(`rooms/${id}/leave/`, "POST", {}, token)
        .then(() => router.push("/"))
        .catch((err) => alert(JSON.stringify(err.data)));
    }
  }

  // ----------------------------------------- //

  return (
    <div className={styles.container}>
      {!isEditing ? (
        <div className={styles.info}>
          <div className={styles.section}>
            <h3>Topic: {room?.topic}</h3>
            <li>
              room ID: <span>{room?.id}</span>
            </li>
          </div>

          <div className={styles.section}>
            <h3>Host</h3>
            <li className={styles.user}>
              <Link href={`/user/${room?.host}`}>
                {room ? usersById[room.host]?.username : ""}
              </Link>
            </li>
          </div>

          <div className={styles.section}>
            <h3>Participants</h3>
            {room?.participants.map((userId) => (
              <li className={styles.user} key={userId}>
                <Link href={`/user/${userId}`}>
                  {usersById[userId]?.username}
                </Link>
              </li>
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

            <div className={styles.field}>
              <span>Participants</span>
              {room?.participants.map((userId) => (
                <label key={userId}>
                  <input
                    defaultChecked
                    disabled={userId == myUser?.user_id}
                    type="checkbox"
                    name={`participants ${userId}`}
                  />
                  {usersById[userId].username}
                </label>
              ))}
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
