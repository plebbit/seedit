import { Role } from "@plebbit/plebbit-react-hooks";

type RolesCollection = Record<string, Role>;

export const findSubplebbitCreator = (roles: RolesCollection | undefined): string => {
  if (!roles) {
    return 'anonymous';
  }

  const owner = Object.keys(roles).find(key => roles[key].role === 'owner');
  if (owner) {
    return owner;
  }

  return 'anonymous';
};
