export interface StudentInfo {
  number: number;
  name: string;
  role: 'student' | 'president' | 'vice' | 'teacher';
}

export const STUDENT_LIST: Record<number, StudentInfo> = {
  1: { number: 1, name: '강민승', role: 'student' },
  2: { number: 2, name: '강승혁', role: 'student' },
  3: { number: 3, name: '권민혁', role: 'student' },
  4: { number: 4, name: '김민수', role: 'student' },
  5: { number: 5, name: '김선우', role: 'student' },
  6: { number: 6, name: '김정우', role: 'student' },
  7: { number: 7, name: '김희상', role: 'student' },
  8: { number: 8, name: '박건희', role: 'student' },
  9: { number: 9, name: '박명균', role: 'student' },
  10: { number: 10, name: '신건우', role: 'student' },
  11: { number: 11, name: '신대건', role: 'student' },
  12: { number: 12, name: '신청민', role: 'president' },
  13: { number: 13, name: '양우현', role: 'student' },
  14: { number: 14, name: '유주환', role: 'student' },
  15: { number: 15, name: '이상현', role: 'student' },
  16: { number: 16, name: '이시형', role: 'student' },
  17: { number: 17, name: '이윤혁', role: 'student' },
  18: { number: 18, name: '이은효', role: 'vice' },
  19: { number: 19, name: '이준', role: 'student' },
  20: { number: 20, name: '이태건', role: 'student' },
  21: { number: 21, name: '이하람', role: 'student' },
  22: { number: 22, name: '임동현', role: 'student' },
  23: { number: 23, name: '장지성', role: 'student' },
  24: { number: 24, name: '정하임', role: 'student' },
  25: { number: 25, name: '정휘준', role: 'student' },
  26: { number: 26, name: '조수형', role: 'student' },
  27: { number: 27, name: '최민석', role: 'student' },
  28: { number: 28, name: '최승혁', role: 'student' },
  29: { number: 29, name: '최찬희', role: 'student' },
  30: { number: 30, name: '허석현', role: 'student' },
  31: { number: 31, name: '황우영', role: 'student' },
  32: { number: 32, name: '황찬윤', role: 'student' },
};
