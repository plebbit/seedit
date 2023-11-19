import { useParams } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import styles from "./about.module.css";
import { useSubplebbit } from "@plebbit/plebbit-react-hooks";

const About = () => {
  const { subplebbitAddress } = useParams();
  const subplebbit = useSubplebbit({subplebbitAddress});
  const { address, createdAt, description, roles, shortAddress, title, updatedAt } = subplebbit || {};

  return (
    <div className={styles.content}>
      <Sidebar
        address={address}
        createdAt={createdAt}
        description={description}
        roles={roles}
        shortAddress={shortAddress}
        title={title}
        updatedAt={updatedAt}
      />
    </div>
  );
}

export default About;
