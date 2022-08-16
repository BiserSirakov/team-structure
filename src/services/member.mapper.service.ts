import { Member } from '../models/member.model';
import { MemberOutput } from '../models/member.output.model';

/**
 * Maps the Member model to a MemberOutput model. (also, recursively maps the employees)
 * @param member Member model
 * @returns Member output model, which is used to be returned to the client.
 */
export function mapMemberToOutput(member: Member): MemberOutput {
  const output: MemberOutput = {
    id: member.id,
    name: member.name,
    email: member.email,
  };

  if (member.employees && member.employees.size) {
    output.employees = [];
  }

  member.employees.forEach((employee) => {
    output.employees?.push(mapMemberToOutput(employee));
  });

  return output;
}

/**
 * Maps the Member output model to a Member model. (also, recursively maps the employees)
 * @param output Member output model
 * @returns Member model, representing the new team structure
 * @throws IncorrectTeamStructureError in case of a validation error
 */
export function mapOutputToMember(output: MemberOutput): Member {
  const validator = Member.getValidator(output.name, output.email);
  if (!validator.validate()) {
    throw new IncorrectTeamStructureError(validator.errors().all());
  }

  const member = new Member(output.name, output.email);

  output.employees?.forEach((employee) => {
    member.addEmployee(mapOutputToMember(employee));
  });

  return member;
}

export class IncorrectTeamStructureError extends Error {
  constructor(public errors: any) {
    super(`Incorrect team structure!`);
  }
}
