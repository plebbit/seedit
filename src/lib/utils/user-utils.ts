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

  const admin = Object.keys(roles).find(key => roles[key].role === 'admin');
  if (admin) {
    return admin;
  }

  return 'anonymous';
};
