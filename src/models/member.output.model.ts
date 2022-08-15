/**
 * Used as a return type to the client
 */
export interface MemberOutput {
  id: string;
  name: string;
  email: string;
  employees?: MemberOutput[];
}
