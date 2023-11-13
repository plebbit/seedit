import { useParams } from "react-router-dom";
import { useSubplebbit } from "@plebbit/plebbit-react-hooks";
import Post from "../../components/post/post";

const Subplebbit = () => {
  const params = useParams();
  const subplebbitAddress = params.subplebbitAddress;
  const subplebbit = useSubplebbit({subplebbitAddress});
  const { title, description, shortAddress } = subplebbit || {};

  return (
    <>
      {title || shortAddress}
    </>
  );
}

export default Subplebbit;
