import { Member } from '../models/member.model';

/** This service is our tree representation */

/**
 * The top manager. (the root of the tree)
 */
let root: Member;

/**
 * Used to keep track of the emails in the team structure.
 */
const emails = new Set<string>();

export function createMember(name: string, email: string, managerId?: string): Member {
  const member = new Member(name, email);

  // If there is a manager with the given id -> add the current member to its employess, otherwise throw an error.
  if (managerId) {
    const manager = getMember(managerId);
    manager.addEmployee(member);
  }
  // If no managerId was passed -> add the current member to the top manager's (root's) employees
  else {
    if (root) {
      root.addEmployee(member);
    }
    // no top manager? -> "promote" the current member
    else {
      root = member;
    }
  }

  // add the email to our email set for uniqueness tracking
  emails.add(member.email);

  return member;
}

export function isEmailUsed(email: string): boolean {
  return emails.has(email);
}

//#region getMember

export class MemberNotFoundError extends Error {
  constructor(memberId: string) {
    super(`No member found with id '${memberId}'!`);
  }
}

function getMember(memberId: string): Member {
  // start the traversal from the root
  const member = dfs(root, memberId);
  if (!member) {
    throw new MemberNotFoundError(memberId);
  }

  return member;
}

/**
 * Preorder Depth–first search (recursive) by member's id
 * @param member currently visited member
 */
function dfs(member: Member, id: string): Member | null {
  console.log('dfs -> ', member.email);

  if (member.id === id) {
    return member;
  }

  for (const employee of member.employees) {
    const res = dfs(employee, id);
    if (res) {
      return res;
    }
  }

  // no member found
  return null;
}

//#endregion
