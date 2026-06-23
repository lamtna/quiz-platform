require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Question = require('../models/Question');
const { DIFFICULTY_LEVELS } = require('../config/constants');

const seed = async () => {
  await connectDB();

  let admin = await User.findOne({ email: 'admin@quiz.com' });
  if (!admin) {
    admin = await User.create({ name: 'Admin', email: 'admin@quiz.com', password: 'Admin@1234', role: 'admin', hasFreeGame: true });
    console.log('✅ Admin: admin@quiz.com / Admin@1234');
  }

  const categoryData = [
    { name: 'العلوم' }, { name: 'التاريخ' }, { name: 'الجغرافيا' },
    { name: 'الرياضة' }, { name: 'التكنولوجيا' }, { name: 'الثقافة العامة' },
  ];
  const sampleQuestions = {
    'العلوم': ['ما هو الرمز الكيميائي للماء؟|H₂O', 'كم عدد عظام جسم الإنسان؟|206', 'أي كوكب يعرف بالكوكب الأحمر؟|المريخ', 'ما هي سرعة الضوء؟|~300,000 كم/ث'],
    'التاريخ': ['من هو أول رئيس للولايات المتحدة؟|جورج واشنطن', 'في أي عام انتهت الحرب العالمية الثانية؟|1945', 'من بنى الأهرامات؟|المصريون القدماء', 'ما هي عاصمة الدولة العثمانية؟|القسطنطينية'],
    'الجغرافيا': ['ما هي عاصمة أستراليا؟|كانبرا', 'ما هو أطول نهر في العالم؟|نهر النيل', 'كم دولة في الاتحاد الأوروبي؟|27', 'ما هو أصغر دولة في العالم؟|مدينة الفاتيكان'],
    'الرياضة': ['كم لاعبًا في فريق كرة القدم؟|11', 'كم حلقة في علم الأولمبياد؟|5', 'في أي بلد نشأت كرة السلة؟|أمريكا', 'كم بطولة غراند سلام في التنس؟|4'],
    'التكنولوجيا': ['ماذا يعني اختصار CPU؟|وحدة المعالجة المركزية', 'من أسس شركة آبل مع ستيف جوبز؟|ستيف وزنياك', 'ماذا يعني HTTP؟|بروتوكول نقل النص التشعبي', 'متى أُطلق أول آيفون؟|2007'],
    'الثقافة العامة': ['من غنى أغنية Thriller؟|مايكل جاكسون', 'ما هي أكبر قارة في العالم؟|آسيا', 'كم عدد دول العالم؟|195 دولة', 'ما هي أعمق بحيرة في العالم؟|بحيرة بايكال'],
  };

  const cats = [];
  for (const c of categoryData) {
    let cat = await Category.findOne({ name: c.name });
    if (!cat) {
      cat = await Category.create({ name: c.name, image: { url: null, publicId: null }, createdBy: admin._id });
      console.log(`✅ Category: ${c.name}`);
    }
    cats.push(cat);
  }

  for (const cat of cats) {
    const qs = sampleQuestions[cat.name] || [];
    for (let i = 0; i < DIFFICULTY_LEVELS.length; i++) {
      const exists = await Question.findOne({ categoryId: cat._id, difficulty: DIFFICULTY_LEVELS[i] });
      if (!exists && qs[i]) {
        const [text, answer] = qs[i].split('|');
        await Question.create({ categoryId: cat._id, text, answer, difficulty: DIFFICULTY_LEVELS[i], createdBy: admin._id });
        console.log(`  ✅ Q (${cat.name} - ${DIFFICULTY_LEVELS[i]}pts)`);
      }
    }
  }
  console.log('\n🎉 Seeding complete!');
  process.exit(0);
};

const destroy = async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Question.deleteMany({})]);
  console.log('🗑️  All data destroyed');
  process.exit(0);
};

process.argv[2] === '--destroy' ? destroy() : seed();
