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

export function getRoot(): Member | undefined {
  return root;
}

export function updateManager(memberId: string, managerId: string): Member {
  const member = getMember(memberId);
  const newManager = getMember(managerId);
  member.updateManager(newManager);

  return member;
}

export function deleteMember(memberId: string): void {
  const member = getMember(memberId);
  member.delete();
  emails.delete(member.email);
}

function getMember(memberId: string): Member {
  const member = find((m) => m.id === memberId);
  if (!member) {
    throw new MemberNotFoundError(memberId);
  }

  return member;
}

export class MemberNotFoundError extends Error {
  constructor(memberId: string) {
    super(`No member found with id '${memberId}'!`);
  }
}

const nums: Number[] = [];
nums.find;

/**
 * Finds the first member where the predicate is true.
 * Iterative Depth-First Search using stack.
 * @param f Predicate, to be applied on every member.
 * @returns The first member that evaluates the predicate to true. Otherwise - undefined.
 */
export function find(f: (member: Member) => boolean): Member | undefined {
  // start the search from the root
  const stack = [root];

  while (stack.length) {
    const current = stack.pop();
    if (!current) break; // ts

    if (f(current)) {
      return current;
    }

    current.employees.forEach((employee) => {
      stack.push(employee);
    });
  }

  return undefined;
}

/**
 * Filters the members where the predicate is true.
 * Iterative Depth-First Search using stack.
 * @param f Predicate, to be applied on every member.
 * @returns An array of members.
 */
export function filter(f: (member: Member) => boolean): Member[] {
  const result: Member[] = [];

  // start the search from the root
  const stack = [root];

  while (stack.length) {
    const current = stack.pop();
    if (!current) break; // ts

    if (f(current)) {
      result.push(current);
    }

    current.employees.forEach((employee) => {
      stack.push(employee);
    });
  }

  return result;
}
