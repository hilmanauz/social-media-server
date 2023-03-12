import * as bcrypt from 'bcryptjs';

const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

const comparedPassword = (password: string, hashedPassword: string) => {
  return bcrypt.compareSync(password, hashedPassword);
};

export default {
  hashPassword,
  comparedPassword,
};
