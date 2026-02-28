export type HadithCategory =
  | 'general_motivation'
  | 'friday'
  | 'prayer_excellence'
  | 'tasbih_excellence'
  | 'repentance'
  | 'fajr_struggle'
  | 'isha_struggle'
  | 'prayer_abandonment'
  | 'tasbih_neglect'
  | 'consistency';

export interface Hadith {
  id: string;
  text: string;
  source: string;
  category: HadithCategory;
}

export const hadiths: Hadith[] = [
  // --- Fajr Struggle ---
  {
    id: 'f1',
    text: 'ركعتا الفجر خير من الدنيا وما فيها',
    source: 'رواه مسلم',
    category: 'fajr_struggle'
  },
  {
    id: 'f2',
    text: 'من صلى الصبح فهو في ذمة الله',
    source: 'رواه مسلم',
    category: 'fajr_struggle'
  },
  {
    id: 'f3',
    text: 'يعقد الشيطان على قافية رأس أحدكم إذا هو نام ثلاث عقد... فإن استيقظ فذكر الله انحلت عقدة، فإن توضأ انحلت عقدة، فإن صلى انحلت عقدة كلها، فأصبح نشيطاً طيب النفس.',
    source: 'متفق عليه',
    category: 'fajr_struggle'
  },

  // --- Isha Struggle ---
  {
    id: 'i1',
    text: 'من صلى العشاء في جماعة فكأنما قام نصف الليل، ومن صلى الصبح في جماعة فكأنما صلى الليل كله',
    source: 'رواه مسلم',
    category: 'isha_struggle'
  },
  {
    id: 'i2',
    text: 'ليس صلاة أثقل على المنافقين من الفجر والعشاء، ولو يعلمون ما فيهما لأتوهما ولو حبوا',
    source: 'متفق عليه',
    category: 'isha_struggle'
  },

  // --- Consistency & Excellence ---
  {
    id: 'c1',
    text: 'أحب الأعمال إلى الله أدومها وإن قل',
    source: 'متفق عليه',
    category: 'consistency'
  },
  {
    id: 'c2',
    text: 'عليك بكثرة السجود لله، فإنك لا تسجد لله سجدة إلا رفعك الله بها درجة، وحط عنك بها خطيئة',
    source: 'رواه مسلم',
    category: 'consistency'
  },
  {
    id: 'c3',
    text: 'استقيموا ولن تحصوا، واعلموا أن خير أعمالكم الصلاة',
    source: 'رواه ابن ماجه',
    category: 'prayer_excellence'
  },

  // --- Repentance (Missed prayers yesterday) ---
  {
    id: 'r1',
    text: 'كل بني آدم خطاء، وخير الخطائين التوابون',
    source: 'رواه الترمذي',
    category: 'repentance'
  },
  {
    id: 'r2',
    text: 'إن الله عز وجل يبسط يده بالليل ليتوب مسيء النهار، ويبسط يده بالنهار ليتوب مسيء الليل',
    source: 'رواه مسلم',
    category: 'repentance'
  },
  {
    id: 'r3',
    text: 'التائب من الذنب كمن لا ذنب له',
    source: 'رواه ابن ماجه',
    category: 'repentance'
  },

  // --- Prayer Abandonment ---
  {
    id: 'a1',
    text: 'العهد الذي بيننا وبينهم الصلاة، فمن تركها فقد كفر',
    source: 'رواه الترمذي',
    category: 'prayer_abandonment'
  },
  {
    id: 'a2',
    text: 'بين الرجل وبين الشرك والكفر ترك الصلاة',
    source: 'رواه مسلم',
    category: 'prayer_abandonment'
  },

  // --- Friday ---
  {
    id: 'fr1',
    text: 'من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين',
    source: 'رواه الحاكم',
    category: 'friday'
  },
  {
    id: 'fr2',
    text: 'خير يوم طلعت عليه الشمس يوم الجمعة، فيه خلق آدم، وفيه أدخل الجنة، وفيه أخرج منها',
    source: 'رواه مسلم',
    category: 'friday'
  },
  {
    id: 'fr3',
    text: 'إن من أفضل أيامكم يوم الجمعة، فأكثروا علي من الصلاة فيه',
    source: 'رواه أبو داود',
    category: 'friday'
  },

  // --- Tasbih ---
  {
    id: 't1',
    text: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم',
    source: 'متفق عليه',
    category: 'tasbih_excellence'
  },
  {
    id: 't2',
    text: 'ألا أنبئكم بخير أعمالكم، وأزكاها عند مليككم، وأرفعها في درجاتكم... ذكر الله',
    source: 'رواه الترمذي',
    category: 'tasbih_excellence'
  },
  {
    id: 'tn1',
    text: 'مثل الذي يذكر ربه والذي لا يذكر ربه كمثل الحي والميت',
    source: 'رواه البخاري',
    category: 'tasbih_neglect'
  },

  // --- General Motivation ---
  {
    id: 'g1',
    text: 'الصلوات الخمس والجمعة إلى الجمعة كفارة لما بينهن ما لم تغش الكبائر',
    source: 'رواه مسلم',
    category: 'general_motivation'
  },
  {
    id: 'g2',
    text: 'تحترقون تحترقون فإذا صليتم الفجر غسلتها، ثم تحترقون تحترقون فإذا صليتم الظهر غسلتها...',
    source: 'رواه الطبراني',
    category: 'general_motivation'
  },
  {
    id: 'g3',
    text: 'لو يعلم الناس ما في النداء والصف الأول ثم لم يجدوا إلا أن يستهموا عليه لاستهموا',
    source: 'متفق عليه',
    category: 'general_motivation'
  }
];
