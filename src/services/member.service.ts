import { Member } from '../models/member.model';

/** This service is our tree representation */

/**
 * The top manager. (the root of the tree)
 */
let root: Member | null;

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

export function getRoot(): Member | null {
  return root;
}

export function setRoot(newRoot: Member): void {
  root = newRoot;
  // TODO: check if the old object is disposed?
}

/**
 * (Dirty solution) // TODO:
 * Checks for duplicate emails in the given team structure
 * @param member the member where the search is started from
 */
export function checkEmails(member: Member): boolean {
  const emails = new Set<string>();

  const stack = [member];

  while (stack.length) {
    const current = stack.pop();
    if (!current) break; // ts

    if (emails.has(current.email)) {
      return false;
    }

    emails.add(current.email);

    current.employees.forEach((employee) => {
      stack.push(employee);
    });
  }

  return true;
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

  // if the root gets deleted, set it to null
  if (root === member) {
    root = null;
  }
}

export function getMember(memberId: string): Member {
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

export interface GetMembersQuery {
  name?: string;
  email?: string;
  managerEmail?: string;
  employeeEmail?: string;
}

export function getMembers(query: GetMembersQuery): Member[] {
  const result = filter((m) => {
    let expression = true;

    if (query.name) {
      expression = expression && m.name.toLowerCase().includes(query.name.toLowerCase());
    }

    if (query.email) {
      expression = expression && m.email.toLowerCase().includes(query.email.toLowerCase());
    }

    if (query.managerEmail) {
      expression =
        expression && m.manager
          ? m.manager.email.toLowerCase().includes(query.managerEmail.toLowerCase())
          : false;
    }

    if (query.employeeEmail) {
      expression =
        expression &&
        m.filterEmployees((e) => e.email.toLowerCase().includes(query.employeeEmail!.toLowerCase()))
          .length > 0;
    }

    return expression;
  });

  return result;
}

/**
 * Finds the first member where the predicate is true.
 * Iterative Depth-First Search using stack.
 * @param f Predicate, to be applied on every member.
 * @returns The first member that evaluates the predicate to true. Otherwise - undefined.
 */
function find(f: (member: Member) => boolean): Member | undefined {
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
function filter(f: (member: Member) => boolean): Member[] {
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
