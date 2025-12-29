const generateRoomId = (): string => {
  const alpha = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
  ]
  let code = "";
  const size = alpha.length;
  for (let i = 0; i < 4; i++) {
    let randomVal = Math.floor(Math.random() * size);
    let char = alpha[randomVal];

    code += char;
  }

  return code;
}

export default generateRoomId;
