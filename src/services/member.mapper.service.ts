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
 * @returns Member model
 */
export function mapOutputToMember(output: MemberOutput): Member {
  const member = new Member(output.name, output.email);
  output.employees?.forEach((employee) => {
    member.addEmployee(mapOutputToMember(employee));
  });

  return member;
}
