import Link from "next/link";
import { useContext, useState } from "react";

import styles from "./RoomSideBar.module.css";
import { StoreContext } from "@/contexts/StoreContext";

function UserSideBar() {
  const { users } = useContext(StoreContext);

  return (
    <div className={styles.sideBar}>
      {users?.map((user, index) => (
        <div key={index} className={styles.roomItem}>
          <Link href={`/user/${user.id}`}>{user.username}</Link>
        </div>
      ))}
    </div>
  );
}

export default UserSideBar;
