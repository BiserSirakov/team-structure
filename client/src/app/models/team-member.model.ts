export interface TeamMember {
  id: string;
  name: string;
  email: string;
  employees?: TeamMember[];
}
