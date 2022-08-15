import crypto from 'crypto';

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
   * Adds the new employee to the current member's employees.
   * @param employee New employee
   */
  addEmployee(employee: Member): void {
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
   * Updates the member's manager. Also, removes the current member from his old manager's employees.
   * @param newManager New manager
   */
  updateManager(newManager: Member): void {
    this._manager?.removeEmployee(this);
    newManager.addEmployee(this);
  }

  /**
   * Deletes the current memeber. If the member has employees, they are transferred to the member's manager.
   */
  delete(): void {
    this._manager?.removeEmployee(this);

    this.employees.forEach((employee) => {
      employee.updateManager(this._manager!);
    });

    this._manager = undefined; // TODO: Check the garbage collector in NodeJS (if the employeeToRemove deleted)
  }
}
