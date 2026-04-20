import { format } from 'date-fns';

const MEAL_API_URL = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
const TIMETABLE_API_URL = 'https://open.neis.go.kr/hub/hisTimetable';

// Pyeongtaek High School (평택고등학교)
// ATPT_OFCDC_SC_CODE: J10 (Gyeonggi)
// SD_SCHUL_CODE: 7530132
export const SCHOOL_CONFIG = {
  ATPT_OFCDC_SC_CODE: 'J10',
  SD_SCHUL_CODE: '7530132',
  GRADE: '1',
  CLASS_NM: '1',
};

export interface MealInfo {
  type: '중식' | '석식';
  menu: string[];
  calorie: string;
  nutrition?: string[]; // Detailed nutrition info
}

export interface TimetableInfo {
  perio: string; // Period
  itrtNm: string; // Subject name
}

export const FALLBACK_MEALS: MealInfo[] = [
  { 
    type: '중식', 
    menu: ['친환경현미밥', '얼큰소고기무국', '수제돈가스', '매콤감자조림', '포기김치', '아이스망고'], 
    calorie: '842 kcal',
    nutrition: ['탄수화물(g) : 112.4', '단백질(g) : 32.5', '지방(g) : 24.8']
  },
  { 
    type: '석식', 
    menu: ['참치마요덮밥', '미소된장국', '떡볶이', '김말이튀김', '단무지무침', '청포도에이드'], 
    calorie: '756 kcal',
    nutrition: ['탄수화물(g) : 105.2', '단백질(g) : 28.1', '지방(g) : 21.4']
  }
];

export const FALLBACK_TIMETABLE: TimetableInfo[] = [
  { perio: '1', itrtNm: '국어' },
  { perio: '2', itrtNm: '수학' },
  { perio: '3', itrtNm: '영어' },
  { perio: '4', itrtNm: '통합사회' },
  { perio: '5', itrtNm: '통합과학' },
  { perio: '6', itrtNm: '한국사' },
  { perio: '7', itrtNm: '자율' },
];

export async function fetchDailyMeals(date: Date = new Date()): Promise<MealInfo[]> {
  const formattedDate = format(date, 'yyyyMMdd');
  
  const params = new URLSearchParams({
    Type: 'json',
    pIndex: '1',
    pSize: '10',
    ATPT_OFCDC_SC_CODE: SCHOOL_CONFIG.ATPT_OFCDC_SC_CODE,
    SD_SCHUL_CODE: SCHOOL_CONFIG.SD_SCHUL_CODE,
    MLSV_YMD: formattedDate,
  });

  try {
    const response = await fetch(`${MEAL_API_URL}?${params.toString()}`);
    const data = await response.json();

    if (data.mealServiceDietInfo) {
      const rows = data.mealServiceDietInfo[1].row;
      
      return rows.map((row: any) => {
        const rawMenu = row.DDISH_NM as string;
        const cleanedMenu = rawMenu
          .replace(/\([0-9\.]+\)/g, '')
          .split('<br/>')
          .map(item => item.trim())
          .filter(item => item.length > 0);

        return {
          type: row.MMEAL_SC_NM as '중식' | '석식',
          menu: cleanedMenu,
          calorie: row.CAL_INFO,
          nutrition: (row.NTR_INFO as string)?.split('<br/>').map(s => s.trim()).filter(s => s.length > 0) || [],
        };
      });
    }
    
    // Fallback if API returns no data for specific date
    return FALLBACK_MEALS;
  } catch (error) {
    console.error('NEIS Meal API Error:', error);
    return FALLBACK_MEALS;
  }
}

export async function fetchDailyTimetable(date: Date = new Date()): Promise<TimetableInfo[]> {
  const formattedDate = format(date, 'yyyyMMdd');
  
  // Current school year based on system date (2026)
  const ay = format(date, 'yyyy');
  // Semester (usually March-August is 1, Sept-Feb is 2)
  const month = date.getMonth() + 1;
  const sem = (month >= 3 && month <= 8) ? '1' : '2';

  const params = new URLSearchParams({
    Type: 'json',
    pIndex: '1',
    pSize: '20',
    ATPT_OFCDC_SC_CODE: SCHOOL_CONFIG.ATPT_OFCDC_SC_CODE,
    SD_SCHUL_CODE: SCHOOL_CONFIG.SD_SCHUL_CODE,
    AY: ay,
    SEM: sem,
    ALL_TI_YMD: formattedDate,
    GRADE: SCHOOL_CONFIG.GRADE,
    CLASS_NM: SCHOOL_CONFIG.CLASS_NM,
  });

  try {
    const response = await fetch(`${TIMETABLE_API_URL}?${params.toString()}`);
    const data = await response.json();

    if (data.hisTimetable) {
      const rows = data.hisTimetable[1].row;
      return rows.map((row: any) => ({
        perio: row.PERIO,
        itrtNm: row.ITRT_NM || row.ITRT_CNTNT || '수업', // Fallback for field names
      })).sort((a: any, b: any) => Number(a.perio) - Number(b.perio));
    }
    
    // Fallback if API returns no data
    return FALLBACK_TIMETABLE;
  } catch (error) {
    console.error('NEIS Timetable API Error:', error);
    return FALLBACK_TIMETABLE;
  }
}
