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

/**
 * Creates a member.
 * @param name Name of the member
 * @param email Email of the member
 * @param managerId Manager Id, optional
 * @returns The newly created member
 */
export function createMember(name: string, email: string, managerId?: string): Member {
  const member = new Member(name, email);

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

/**
 * Checks if the given email has already been used
 * @param email Email to be checked
 */
export function isEmailUsed(email: string): boolean {
  return emails.has(email);
}

/**
 * Gets the root of the team structure
 * @returns The top manager (if there is one)
 */
export function getRoot(): Member | null {
  return root;
}

/**
 * Sets the top manager of the team structure
 * @param newRoot New root
 */
export function setRoot(newRoot: Member): void {
  root = newRoot;
}

/**
 * (Dirty solution, used only during import) // TODO: reuse the traverse function (having troubles with the callbacks)
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

/**
 * TODO: thats initial/dirty solution.
 * - Check how to optimize.
 * - Check if the tree should be traversed multiple times until the balance check is satisfied.
 * - Check if the hierarchy level / height can be utilized in this algorithm
 *
 * v0.1 Rebalances the team by a given balance index
 * @param balanceIndex Number of employees that every manager should have
 * @returns The root of the new rebalanced team
 */
export function rebalanceTeam(balanceIndex: number): Member {
  if (!root) {
    throw new Error('The team structure is empty.');
  }

  if (balanceIndex < 1) {
    throw new Error('The balance index must be equal or greater than 1!');
  }

  traverse((member) => {
    const currentManager = member.manager;

    // if the current member's manager employees are more than balanceIndex
    // get the extra siblings of the current memeber and move them under him
    if (currentManager && currentManager?.employees.size > balanceIndex) {
      const extraSiblings = Array.from(currentManager.employees).slice(balanceIndex);
      extraSiblings.forEach((s) => s.delete(false));

      // for each sibling (my manager's employees, including myself)
      // if sibling.employees.size > X -> skip
      // if sibling.employees.size = X -> skip
      // if sibling.employees.size < X -> add the deleted members (until sibling.employees.size = x). If there are still remaining deleted members -> continue on next sibling. If no more siblings - add all remaining deleted members to the current sibling.
      currentManager.employees.forEach((sibling) => {
        if (sibling.employees.size < balanceIndex && extraSiblings.length) {
          while (sibling.employees.size < balanceIndex && extraSiblings.length) {
            const extraSibling = extraSiblings.pop();
            if (extraSibling) {
              sibling.addEmployee(extraSibling);
            }
          }
        }
      });

      // if there are remaining extraSiblings -> add them to the last sibling
      if (extraSiblings.length) {
        const siblings = Array.from(currentManager.employees);
        const lastSibling = siblings[siblings.length - 1];
        while (extraSiblings.length) {
          const extraSibling = extraSiblings.pop();
          if (extraSibling) {
            lastSibling.addEmployee(extraSibling);
          }
        }
      }
    }

    // if the current member's manager employees are less than balanceIndex
    // move people from 2 levels below 1 level up
    if (currentManager && currentManager?.employees.size < balanceIndex) {
      let numberOfMembersToPromote = balanceIndex - currentManager.employees.size;

      // two nested loops are used to avoid the members jumping 2 or more levels up/down
      // for each sibling (my manager's employees, including myself)
      const siblings = Array.from(currentManager.employees);
      for (let i = 0; i < siblings.length && numberOfMembersToPromote; i++) {
        const sibling = siblings[i];
        const siblingEmployees = Array.from(sibling.employees);
        for (let j = 0; j < siblingEmployees.length && numberOfMembersToPromote; j++) {
          const siblingEmployee = siblingEmployees[j];
          siblingEmployee.updateManager(currentManager);
          numberOfMembersToPromote--;
        }
      }
    }
  });

  // return the updated tree structure (the root)
  return root;
}

/**
 * Demotes a member. Demote = Delete + Update manager. The member's employees are transferred to his manager, then the member is transferred to the new manager.
 * @param memberId Member to be demoted
 * @param managerId New manager
 * @returns The updated member
 */
export function demoteManager(memberId: string, managerId: string): Member {
  const member = getMember(memberId);
  if (member === root) {
    throw new Error('The top manager cannot be demoted.');
  }

  const newManager = getMember(managerId);

  member.delete();
  member.updateManager(newManager);

  return member;
}

/**
 * Updates the member's manager.
 * @param memberId Member to be updated
 * @param managerId New manager
 * @returns The updated member
 */
export function updateManager(memberId: string, managerId: string): Member {
  const member = getMember(memberId);
  const newManager = getMember(managerId);
  member.updateManager(newManager);

  return member;
}

/**
 * Deltes a member.
 * @param memberId Member to be deleted
 */
export function deleteMember(memberId: string): void {
  const member = getMember(memberId);
  member.delete();
  emails.delete(member.email);

  // if the root gets deleted, set it to null
  if (root === member) {
    root = null;
  }
}

/**
 * Gets a member by a given id
 * @param memberId Member Id
 * @returns The member with the given id
 * @throws MemberNotFoundError in case no member was found
 */
export function getMember(memberId: string): Member {
  const member = find((m) => m.id === memberId);
  if (!member) {
    throw new MemberNotFoundError(memberId);
  }

  return member;
}

/**
 * Specific error definition thrown if a member was not found.
 */
export class MemberNotFoundError extends Error {
  constructor(memberId: string) {
    super(`No member found with id '${memberId}'!`);
  }
}

/**
 * Available filters
 */
export interface GetMembersQuery {
  name?: string;
  email?: string;
  managerEmail?: string;
  employeeEmail?: string;
}

/**
 * Filters the current team structure and returns a collection of members.
 * @param query A set of filters
 * @returns An array of members
 */
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
 * Iterative Depth-First Search (using stack)
 * @param callback Predicate, to be applied on every member.
 * @returns The first member that evaluates the predicate to true. Otherwise - undefined.
 */
export function find(callback: (member: Member) => boolean): Member | undefined {
  // start the search from the root
  const stack = [root];

  // TODO: reuse the traverse function (having troubles with the callbacks)
  while (stack.length) {
    const current = stack.pop();

    if (current && callback(current)) {
      return current;
    }

    current?.employees.forEach((employee) => {
      stack.push(employee);
    });
  }

  return undefined;
}

/**
 * Filters the members where the predicate is true.
 * @param callback To be applied on every member.
 * @returns An array of members.
 */
function filter(callback: (member: Member) => boolean): Member[] {
  const result: Member[] = [];

  traverse((member) => {
    if (callback(member)) {
      result.push(member);
    }
  });

  return result;
}

/**
 * Traverses the team structure from the root.
 * Iterative Breadth-First Search (using queue)
 * @param callback To be executed for every member in the team structure
 */
function traverse(callback: (member: Member) => void): void {
  // start the search from the root
  const queue = [root];

  while (queue.length) {
    const current = queue.shift();

    if (current) {
      callback(current);
    }

    current?.employees.forEach((employee) => {
      queue.push(employee);
    });
  }
}
