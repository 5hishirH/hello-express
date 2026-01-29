import { UpdateUserInput } from "../validators/index.js";

export interface UpdateDto extends UpdateUserInput {
  profilePic?: string;
}
