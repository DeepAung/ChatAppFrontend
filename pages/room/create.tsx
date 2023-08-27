import { AuthContext } from "@/contexts/AuthContext";
import { fetchData } from "@/utils/fetchData";
import { useRouter } from "next/router";
import React, { useContext } from "react";

import styles from "./[id].module.css";

function RoomSetting() {
  const router = useRouter();
  const { token, myUser } = useContext(AuthContext);

  type FieldType = {
    name: string;
    showName: string;
    value?: string;
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

  async function saveEdit(e: any) {
    e.preventDefault();

    const body = {
      topic: e.target.topic.value,
      host: myUser?.user_id,
      participants: [myUser?.user_id],
    };

    fetchData(`rooms/`, "POST", body, token)
      .then((room) => router.push(`/?room=${room.id}`))
      .catch((err) => alert(JSON.stringify(err.data)));
  }

  // ----------------------------------------- //

  return (
    <div className={styles.container}>
      <form className={styles.info} onSubmit={saveEdit}>
        <div className={styles.wrapper}>
          <InputField name="topic" showName="Topic" />
        </div>
        <input type="submit" value="Save" />
      </form>
    </div>
  );
}

export default RoomSetting;
