import { AuthContext } from "@/contexts/AuthContext";
import { User } from "@/types/User";
import { fetchData } from "@/utils/fetchData";
import { useRouter } from "next/router";
import React, {
  ChangeEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import styles from "./[id].module.css";

function UserProfile() {
  const router = useRouter();
  const { id: idStr } = router.query;
  const id = Number(idStr);

  const { token, myUser } = useContext(AuthContext);
  const [user, setUser] = useState<User>();
  const [isEditing, setIsEditing] = useState(false);
  const [triggerUseEffect, setTriggerUseEffect] = useState(false);

  const hasName = useMemo(() => {
    if (user && user.first_name && user.last_name) return true;
    return false;
  }, [user]);

  // ----------------------------------------- //

  const [imageName, setImageName] = useState("Upload an avatar");

  function updateImageName(e: ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value.replace(/.*[\/\\]/, "");
    setImageName(newValue);
  }

  const avatarField = useRef<HTMLInputElement>(null);

  function uploadAvatar(e: any) {
    e.preventDefault();
    avatarField.current?.click();
  }

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

  const TextAreaField = ({ name, showName, value }: FieldType) => (
    <div className={styles.field}>
      <span>{showName}</span>
      <textarea
        name={name}
        title={showName}
        placeholder={showName}
        defaultValue={value || ""}
      />
    </div>
  );

  // ----------------------------------------- //

  useEffect(() => {
    if (Number.isNaN(id) || token == undefined) return;

    fetchData(`users/${id}/`, "GET", {}, token)
      .then((data) => setUser(data))
      .catch((err) => console.log(err));
  }, [id, token, triggerUseEffect]);

  async function saveEdit(e: any) {
    e.preventDefault();

    let formData = new FormData();
    formData.append("first_name", e.target.first_name.value);
    formData.append("last_name", e.target.last_name.value);
    formData.append("username", e.target.username.value);
    formData.append("address", e.target.address.value);
    formData.append("bio", e.target.bio.value);

    const file = e.target.avatar.files[0];
    if (file) formData.append("avatar", file);

    const url = `users/${myUser?.user_id}/`;
    fetchData(url, "PATCH", formData, token, false)
      .catch((err) => console.log(err))
      .finally(() => {
        setIsEditing(false);
        setImageName("Upload an avatar");
        setTriggerUseEffect(!triggerUseEffect);
      });
  }

  async function cancelEdit(e: any) {
    setIsEditing(false);
    setImageName("Upload an avatar");
  }

  // ----------------------------------------- //

  return (
    <div className={styles.container}>
      {user && (
        <Image
          priority
          src={user?.get_avatar}
          width={1000}
          height={1000}
          alt="Profile"
          className={styles.img}
        />
      )}

      {!isEditing ? (
        <div className={styles.info}>
          <div className={styles.section}>
            {hasName ? (
              <>
                <h1>{user?.first_name + " " + user?.last_name}</h1>
                <h3>({user?.username})</h3>
              </>
            ) : (
              <h1>{user?.username}</h1>
            )}
          </div>

          <div className={styles.section}>
            <h3>Address</h3>
            <p>{user?.address || "None"}</p>
          </div>

          <div className={styles.section}>
            <h3>Bio</h3>
            <p>{user?.bio || "None"}</p>
          </div>

          {myUser?.user_id == user?.id && (
            <button
              onClick={(e) => setIsEditing(true)}
              title="Edit"
              type="button"
            >
              Edit
            </button>
          )}
        </div>
      ) : (
        <form className={styles.info} onSubmit={saveEdit}>
          <div className={styles.wrapper}>
            <InputField
              name="first_name"
              showName="First Name"
              value={user?.first_name}
            />
            <InputField
              name="last_name"
              showName="Last Name"
              value={user?.last_name}
            />
            <InputField
              name="username"
              showName="Username"
              value={user?.username}
            />
            <InputField
              name="address"
              showName="Address"
              value={user?.address}
            />

            <div className={styles.field}>
              <span>Profile</span>
              <label onClick={uploadAvatar} htmlFor="avatar">
                {imageName}
              </label>
              <input
                type="file"
                id="avatar"
                name="avatar"
                aria-label="Avatar"
                ref={avatarField}
                onChange={updateImageName}
                // style={{ display: "none" }}
              />
            </div>

            <TextAreaField name="bio" showName="Bio" value={user?.bio} />
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

export default UserProfile;
