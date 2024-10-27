import { Message, User } from "../types";

const users: User[] = [];

export const loginUser = (user: User) : string => {
  const userIndex = users.findIndex((x: User) => x.name === user.name);
  let result: Message = { type: "", data: "", id: 0 };
  if (userIndex === -1) {
    users.push(user);
    result = {
      type: 'reg',
      data: JSON.stringify({
        name: user.name,
        index: users.length - 1,
        error: false,
        errorText: "",
      }),
      id: 0,
    }
  } else {
    const isCorrectPassword = users.at(userIndex)?.password !== user.password;
    result = {
      type: 'reg',
      data: JSON.stringify({
        name: user.name,
        index: users.length - 1,
        error: isCorrectPassword,
        errorText: isCorrectPassword ? "Wrong password" : "",
      }),
      id: 0,
    }
  }
  return JSON.stringify(result);
}