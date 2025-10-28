export interface PasswordRequirement {
  id: string;
  text: string;
  regex: RegExp;
  met: boolean;
}
