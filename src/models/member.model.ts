import crypto from 'crypto';
import { make } from 'simple-body-validator';

/**
 * Represents a member of the team. A member can be a manager/employee.
 */
export class Member {
  private _id: string = crypto.randomUUID();
  private _employees: Set<Member> = new Set<Member>();
  private _manager?: Member;

  constructor(public name: string, public email: string) {}

  /**
   * Gets the member's id.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Gets the member's employees.
   */
  get employees(): Set<Member> {
    return this._employees;
  }

  /**
   * Gets the member's manager.
   */
  get manager(): Member | undefined {
    return this._manager;
  }

  /**
   * Adds the new employee to the current member's employees.
   * @param employee New employee
   */
  addEmployee(employee: Member): void {
    if (employee === this) {
      throw new Error('A member cannot have itslef as an employee.');
    }

    employee._manager = this;
    this.employees.add(employee);
  }

  /**
   * Removes the employee from the member's employees
   * @param employeeToRemove Employee to be removed
   */
  removeEmployee(employeeToRemove: Member): void {
    this.employees.delete(employeeToRemove);
  }

  /**
   * Filters the member's employees where the predicate is true.
   * @param f Predicate, to be applied on every employee.
   * @returns An array of employees.
   */
  filterEmployees(f: (employee: Member) => boolean): Member[] {
    const result: Member[] = [];

    for (const employee of this.employees) {
      if (f(employee)) {
        result.push(employee);
      }
    }

    return result;
  }

  /**
   * Updates the member's manager. Also, removes the current member from his old manager's employees.
   * @param newManager New manager
   */
  updateManager(newManager?: Member): void {
    this.manager?.removeEmployee(this);
    newManager?.addEmployee(this);
  }

  /**
   * Deletes the current memeber. If the member has employees, they are transferred to the member's manager.
   */
  delete(): void {
    this.manager?.removeEmployee(this);

    this.employees.forEach((employee) => {
      employee.updateManager(this.manager);
    });

    this._manager = undefined; // TODO: Check the garbage collector in NodeJS (if the current object gets deleted)
  }

  /**
   * Gets a validator with predefined rules.
   * @param name A name, to be validated.
   * @param email An email, to be validated.
   * @returns A validator object
   */
  static getValidator(name: string, email: string) {
    const rules = {
      name: 'required|string',
      email: 'required|email',
    };

    return make({ name, email }, rules);
  }
}
