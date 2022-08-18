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
 * (Dirty solution) // TODO: reuse the traverse function (having troubles with the callbacks)
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

  // Time (n*2)
  traverse((member) => {
    // if the current member's manager employees are more than balanceIndex
    // get the extra siblings of the current memeber and move them under him
    if (member.manager && member.manager?.employees.size > balanceIndex) {
      const extraSiblings = Array.from(member.manager.employees)
        // .filter((m) => m !== member)
        .slice(balanceIndex);

      extraSiblings.forEach((s) => s.delete(false));

      // if sibling.employees.size > X -> skip
      // if sibling.employees.size = X -> skip
      // if sibling.employees.size < X -> add the deleted members (until sibling.employees.size = x). If there are still remaining deleted members -> continue on next sibling. If no more siblings - add all remaining deleted members to the current sibling.

      // for each sibling (my manager's employees, including myself)
      member.manager.employees.forEach((sibling) => {
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
        const siblings = Array.from(member.manager.employees);
        const lastSibling = siblings[siblings.length - 1];
        while (extraSiblings.length) {
          const extraSibling = extraSiblings.pop();
          if (extraSibling) {
            lastSibling.addEmployee(extraSibling);
          }
        }
      }
    }

    // we use two loops to avoid the members jumping 2 or more levels up/down

    // if the current member's manager employees are less than balanceIndex
    // move people from 2 levels below 1 level up
    if (member.manager && member.manager?.employees.size < balanceIndex) {
      let numberOfMembersToPromote = balanceIndex - member.manager.employees.size;
      // for each sibling (my manager's employees, including myself) dokato numberOfMembersToPromote
      // sibling.employee.updatemanager(member.manager)
      const siblings = Array.from(member.manager.employees);
      for (let i = 0; i < siblings.length && numberOfMembersToPromote; i++) {
        const sibling = siblings[i];
        const siblingEmployees = Array.from(sibling.employees);
        for (let j = 0; j < siblingEmployees.length && numberOfMembersToPromote; j++) {
          const siblingEmployee = siblingEmployees[j];
          siblingEmployee.updateManager(member.manager);
          numberOfMembersToPromote--;
        }
      }

      // no recursion here as one of the points in the assignment is stating:
      // 'Members don’t like moving too much in the hierarchy, they prefer to move 1 level up/down instead of making a jump of 2 levels'

      // move numberOfMembersToPromote number of my employees (or my siblings' employees) to my manager
      // const siblings = Array.from(member.manager.employees);
      // for (let i = 0; i < siblings.length && numberOfMembersToPromote; i++) {
      //   const sibling = siblings[i];
      //   const siblingEmployees = Array.from(sibling.employees);
      //   for (let j = 0; j < siblingEmployees.length && numberOfMembersToPromote; j++) {
      //     const siblingEmployee = siblingEmployees[j];
      //     siblingEmployee.updateManager(member.manager);
      //     numberOfMembersToPromote--;
      //   }
      // }
    }
  });

  return root;
}

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

// /**
//  * Traverses the team structure from the root.
//  * Iterative Depth-First Search (using stack)
//  * @param callback To be executed for every member in the team structure
//  */
// function traverse_dfs(callback: (member: Member) => void): void {
//   // start the search from the root
//   const stack = [root];

//   while (stack.length) {
//     const current = stack.pop();

//     if (current) {
//       callback(current);
//     }

//     current?.employees.forEach((employee) => {
//       stack.push(employee);
//     });
//   }
// }
