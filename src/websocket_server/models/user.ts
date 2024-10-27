import { Message, MessageType, User } from "../types";

const users: User[] = [];

export const getUserById = (id: string) : User => {
  return users.filter((x: User) => x.wsId === id)[0];
}

export const loginUser = (user: User) : string => {
  const userIndex = users.findIndex((x: User) => x.name === user.name);
  let result: Message = { type: "", data: "", id: 0 };
  if (userIndex === -1) {
    users.push({
      ...user,
      isLogined: true,
    });
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
    const currentUser = users.at(userIndex);
    if (currentUser?.isLogined) {
      result = {
        type: 'reg',
        data: JSON.stringify({
          name: user.name,
          index: users.length - 1,
          error: true,
          errorText: "User with this name was already logined in",
        }),
        id: 0,
      }
    } else {
      const isCorrectPassword = currentUser?.password !== user.password;
      result = {
        type: MessageType.USER_LOGIN,
        data: JSON.stringify({
          name: user.name,
          index: users.length - 1,
          error: isCorrectPassword,
          errorText: isCorrectPassword ? "Wrong password" : "",
        }),
        id: 0,
      }
    }    
  }
  return JSON.stringify(result);
}