import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BookOpen, CheckCircle, Circle, RefreshCw, Search, GraduationCap, Layout, Sparkles, MessageCircle, X, Send, Loader2, Info } from 'lucide-react';

// --- Gemini API Configuration ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

const callGemini = async (prompt) => {
  if (!apiKey) {
    return 'مفتاح Gemini غير مُعد — ضع VITE_GEMINI_API_KEY في ملف .env أو ضمن أسرار المستودع.';
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من الحصول على إجابة.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ أثناء الاتصال بالمستشار الذكي. يرجى المحاولة لاحقاً.";
  }
};

// --- Data Definition based on NEW User Input (Plan 2) ---

const INITIAL_DATA = [
  { id: '0200104', name: 'التربية الوطنية', hours: 3, category: 'uni_comp', prereq: '-' },
  { id: '0200105', name: 'مهارات الاتصال (عربي 1)', hours: 3, category: 'uni_comp', prereq: '0200150, 0201001' },
  { id: '0200106', name: 'مهارات الاتصال (إنجليزي 1)', hours: 3, category: 'uni_comp', prereq: '0200151, 0202001' },
  { id: '0200110', name: 'العلوم العسكرية', hours: 3, category: 'uni_comp', prereq: '-' },
  { id: '0200111', name: 'الثقافة الاسلامية وقضايا العصر', hours: 3, category: 'uni_comp', prereq: '-' },
  { id: '0200115', name: 'تنمية المجتمع والعمل التطوعي', hours: 0, category: 'uni_comp', prereq: '-' },
  { id: '0200153', name: 'المهارات الحياتية', hours: 1, category: 'uni_comp', prereq: '-' },
  { id: '0200154', name: 'القيادة والمسؤولية المجتمعية', hours: 1, category: 'uni_comp', prereq: '-' },
  { id: '0400202', name: 'الريادة والابتكار', hours: 1, category: 'uni_comp', prereq: '-' },

  { id: '0200113', name: 'تاريخ الاردن وفلسطين', hours: 3, category: 'uni_elec', prereq: '-' },
  { id: '0200114', name: 'القدس تاريخ وحضارة', hours: 3, category: 'uni_elec', prereq: '-' },
  { id: '0200116', name: 'مهارات الاتصال (عربي 2)', hours: 3, category: 'uni_elec', prereq: '0200105' },
  { id: '0200122', name: 'مبادئ علم التربية', hours: 3, category: 'uni_elec', prereq: '-' },
  { id: '0200125', name: 'مبادئ علم القانون', hours: 3, category: 'uni_elec', prereq: '-' },
  { id: '0200127', name: 'اخلاقيات الطالب الجامعي', hours: 3, category: 'uni_elec', prereq: '-' },
  { id: '0200130', name: 'جرائم الارهاب', hours: 3, category: 'uni_elec', prereq: '-' },
  { id: '0200156', name: 'التنمية والبيئة', hours: 3, category: 'uni_elec', prereq: '-' },
  { id: '0300123', name: 'مبادئ علم الفلك', hours: 3, category: 'uni_elec', prereq: '-' },
  { id: '0300124', name: 'الثقافة العلمية', hours: 3, category: 'uni_elec', prereq: '-' },
  { id: '0300157', name: 'الثقافة الرقمية', hours: 3, category: 'uni_elec', prereq: '-' },
  { id: '0300161', name: 'الاسعافات الاولية', hours: 3, category: 'uni_elec', prereq: '-' },

  { id: '0300220', name: 'رياضيات متقطعة', hours: 3, category: 'col_comp', prereq: '1501114' },
  { id: '1501110', name: 'برمجة الحاسوب (1)', hours: 3, category: 'col_comp', prereq: '1501114' },
  { id: '1501111', name: 'مختبر برمجة الحاسوب (1)', hours: 1, category: 'col_comp', prereq: '1501114' },
  { id: '1501112', name: 'برمجة الحاسوب (2)', hours: 3, category: 'col_comp', prereq: '1501110' },
  { id: '1501113', name: 'مختبر برمجة الحاسوب (2)', hours: 1, category: 'col_comp', prereq: '1501111' },
  { id: '1501114', name: 'اساسيات تكنولوجيا المعلومات', hours: 3, category: 'col_comp', prereq: '-' },
  { id: '1506180', name: 'برمجة ويب (1)', hours: 3, category: 'col_comp', prereq: '1501110' },
  { id: '1506181', name: 'مختبر برمجة ويب (1)', hours: 1, category: 'col_comp', prereq: '1501111' },
  { id: '1509999', name: 'حلقة بحث لطلبة IT', hours: 0, category: 'col_comp', prereq: '-' },

  { id: '1501130', name: 'تصميم المنطق الرقمي', hours: 3, category: 'major_comp', prereq: '-' },
  { id: '1501212', name: 'برمجة مرئية', hours: 3, category: 'major_comp', prereq: '1501222' },
  { id: '1501221', name: 'تراكيب البيانات', hours: 3, category: 'major_comp', prereq: '1501112' },
  { id: '1501222', name: 'نظم قواعد البيانات', hours: 3, category: 'major_comp', prereq: '1501112' },
  { id: '1501231', name: 'تنظيم وعمارة الحاسوب', hours: 3, category: 'major_comp', prereq: '1501130' },
  { id: '1501272', name: 'طرق عددية لعلم الحاسوب', hours: 3, category: 'major_comp', prereq: '0301241' },
  { id: '1501321', name: 'تصميم وتحليل الخوارزميات', hours: 3, category: 'major_comp', prereq: '1501221' },
  { id: '1501322', name: 'نظرية الحسابات', hours: 3, category: 'major_comp', prereq: '1501221' },
  { id: '1501328', name: 'تحليل نظم', hours: 3, category: 'major_comp', prereq: '1501222' },
  { id: '1501340', name: 'شبكات الحاسوب', hours: 3, category: 'major_comp', prereq: '1501112' },
  { id: '1501385', name: 'برمجة الهواتف الذكية', hours: 3, category: 'major_comp', prereq: '1501112' },
  { id: '1501391', name: 'تدريب ميداني للحاسوب', hours: 0, category: 'major_comp', prereq: '90 ساعة' },
  { id: '1501430', name: 'نظم التشغيل', hours: 3, category: 'major_comp', prereq: '1501221' },
  { id: '1501437', name: 'ادوات ولغات قواعد البيانات', hours: 3, category: 'major_comp', prereq: '1501222' },
  { id: '1501438', name: 'الحوسبة السحابية', hours: 3, category: 'major_comp', prereq: '1501340, 1501430' },
  { id: '1501495', name: 'مشروع في علم الحاسوب', hours: 3, category: 'major_comp', prereq: '120 ساعة' },
  { id: '1503270', name: 'مقدمة لهندسة البرمجيات', hours: 3, category: 'major_comp', prereq: '1501114' },
  { id: '1505101', name: 'البرمجة بلغة بايثون', hours: 3, category: 'major_comp', prereq: '1501110' },
  { id: '1505201', name: 'مقدمة في الذكاء الاصطناعي', hours: 3, category: 'major_comp', prereq: '1501114' },
  { id: '1505311', name: 'تعلم الالة', hours: 3, category: 'major_comp', prereq: '1505101, 1505201' },
  { id: '1505366', name: 'معالجة الصور الرقمية', hours: 3, category: 'major_comp', prereq: '0301241, 1505101' },
  { id: '1506140', name: 'اساسيات الامن السيبراني', hours: 3, category: 'major_comp', prereq: '-' },
  { id: '1506280', name: 'برمجة ويب (2)', hours: 3, category: 'major_comp', prereq: '1506180' },
  { id: '1506348', name: 'الشبكات اللاسلكية', hours: 3, category: 'major_comp', prereq: '1501340' },

  { id: '1501211', name: 'لغات خاصة في البرمجة', hours: 3, category: 'major_elec', prereq: '1501112' },
  { id: '1501323', name: 'بحوث العمليات', hours: 3, category: 'major_elec', prereq: '1501221' },
  { id: '1501324', name: 'لغات البرمجة', hours: 3, category: 'major_elec', prereq: '1501112' },
  { id: '1501327', name: 'الرسم بالحاسوب', hours: 3, category: 'major_elec', prereq: '1505366' },
  { id: '1501360', name: 'مناهج واخلاقيات البحث العلمي', hours: 3, category: 'major_elec', prereq: '-' },
  { id: '1501434', name: 'ادارة نظم قواعد البيانات', hours: 3, category: 'major_elec', prereq: '1501222' },
  { id: '1501435', name: 'موضوعات خاصة في علم الحاسوب (1)', hours: 3, category: 'major_elec', prereq: '-' },
  { id: '1501436', name: 'موضوعات خاصة في علم الحاسوب (2)', hours: 3, category: 'major_elec', prereq: '-' },
  { id: '1501439', name: 'النظم المتوازية والموزعة', hours: 3, category: 'major_elec', prereq: '1501430' },
  { id: '1506341', name: 'امن المعلومات والشبكات', hours: 3, category: 'major_elec', prereq: '1501340, 1506140' },
  { id: '1506493', name: 'إنترنت الأشياء', hours: 3, category: 'major_elec', prereq: '1501340' },

  { id: '0300103', name: 'الإحصاء والاحتمالات', hours: 3, category: 'support', prereq: '-' },
  { id: '0301241', name: 'الجبر الخطي 1', hours: 3, category: 'support', prereq: '-' },

  { id: 'free_001', name: 'مادة حرة', hours: 3, category: 'free_elec', prereq: '-' }
];

const CATEGORIES = {
  uni_comp: { title: 'متطلبات الجامعة الإجبارية', req: 18 },
  uni_elec: { title: 'متطلبات الجامعة الإختيارية', req: 9 },
  col_comp: { title: 'متطلبات الكلية الإجبارية', req: 18 },
  major_comp: { title: 'متطلبات التخصص الإجبارية', req: 69 },
  major_elec: { title: 'متطلبات التخصص الإختيارية', req: 9 },
  support: { title: 'المتطلبات المساندة', req: 6 },
  free_elec: { title: 'المتطلبات الحرة', req: 3 },
};

// --- Components for Gemini Features ---

const InsightModal = ({ course, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      const prompt = `
        أنت مستشار أكاديمي لتخصص علم الحاسوب.
        اشرح مادة الجامعة التالية: "${course.name}" (رمزها: ${course.id}).
        اشرح باختصار (نقطتين أو ثلاث) ماذا يتعلم الطالب فيها ولماذا هي مهمة لتخصص الحاسوب.
        أجب باللغة العربية.
      `;
      const result = await callGemini(prompt);
      setInsight(result);
      setLoading(false);
    };

    if (course) {
      fetchInsight();
    }
  }, [course]);

  if (!course) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-300" />
            تحليل ذكي للمادة
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <h4 className="font-bold text-lg text-gray-800 mb-1">{course.name}</h4>
          <span className="text-sm text-gray-500 font-mono mb-4 block">{course.id}</span>
          
          <div className="bg-purple-50 rounded-lg p-4 min-h-[100px] border border-purple-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center text-purple-600 h-24 gap-2">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-sm">جاري تحليل المادة...</span>
              </div>
            ) : (
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{insight}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdvisorChat = ({ courses, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'مرحباً! أنا مستشارك الأكاديمي الذكي. كيف يمكنني مساعدتك اليوم بخصوص خطتك الدراسية؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const completed = courses.filter(c => c.completed).map(c => c.name);
    const remaining = courses.filter(c => !c.completed).map(c => c.name);
    
    const prompt = `
      أنت مرشد أكاديمي ذكي لتخصص علم الحاسوب. تتحدث مع طالب في الجامعة.
      
      سياق الطالب:
      - المواد المقطوعة (${completed.length} مادة): ${completed.join(', ')}.
      - المواد المتبقية (${remaining.length} مادة): ${remaining.slice(0, 30).join(', ')}... (وغيرها).
      
      سؤال الطالب: "${userMsg}"
      
      أجب الطالب بناءً على حالته الدراسية. كن مشجعاً وقدم نصائح عملية. تكلم باللغة العربية.
      اجعل إجابتك موجزة ومفيدة.
    `;

    const aiResponse = await callGemini(prompt);
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full h-[85vh] sm:h-[600px] sm:max-w-lg sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 flex justify-between items-center text-white shrink-0 sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Sparkles size={20} className="text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold">المستشار الأكاديمي</h3>
              <p className="text-xs text-blue-200">مدعوم من Gemini AI</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-xs text-gray-500">يكتب...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-3 rounded-xl transition shadow-sm"
            >
              <Send size={20} className={loading ? "" : "ml-0.5"} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب سؤالك للمستشار هنا..."
              className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none text-right"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('cs_plan_data_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return INITIAL_DATA.map(c => ({
          ...c,
          completed: parsed.find(p => p.id === c.id)?.completed || false
        }));
      } catch (e) {
        return INITIAL_DATA.map(c => ({ ...c, completed: false }));
      }
    }
    return INITIAL_DATA.map(c => ({ ...c, completed: false }));
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [insightCourse, setInsightCourse] = useState(null);

  useEffect(() => {
    localStorage.setItem('cs_plan_data_v2', JSON.stringify(courses.map(c => ({ id: c.id, completed: c.completed }))));
  }, [courses]);

  const toggleCourse = (id) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const resetProgress = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة تعيين جميع البيانات؟')) {
      setCourses(INITIAL_DATA.map(c => ({ ...c, completed: false })));
    }
  };

  const stats = useMemo(() => {
    let totalCompleted = 0;
    const catStats = {};

    Object.keys(CATEGORIES).forEach(key => {
      catStats[key] = { completed: 0, required: CATEGORIES[key].req };
    });

    courses.forEach(course => {
      if (course.completed) {
        totalCompleted += course.hours;
        if (catStats[course.category]) {
           catStats[course.category].completed += course.hours;
        }
      }
    });

    return { totalCompleted, catStats };
  }, [courses]);

  const totalRequired = 132;
  const progressPercentage = Math.min(100, Math.round((stats.totalCompleted / totalRequired) * 100));

  const filteredCourses = courses.filter(course => 
    (activeTab === 'all' || course.category === activeTab) &&
    (course.name.includes(searchTerm) || course.id.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800" dir="rtl">
      
      <header className="bg-indigo-900 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <GraduationCap size={32} className="text-yellow-400" />
              <div>
                <h1 className="text-xl font-bold">خطة علم الحاسوب (132 ساعة)</h1>
                <p className="text-indigo-200 text-sm">متابعة المواد الدراسية</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <button 
                onClick={() => setShowAdvisor(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl shadow-md border border-white/10 transition-all transform hover:scale-105 active:scale-95"
              >
                <Sparkles size={18} className="text-yellow-300 animate-pulse" />
                <span className="font-bold text-sm">المستشار الذكي</span>
              </button>

              <div className="hidden md:flex items-center gap-6 bg-indigo-800 px-6 py-2 rounded-xl border border-indigo-700">
                <div className="text-center">
                  <span className="block text-xs text-indigo-300">المنجز</span>
                  <span className="text-2xl font-bold text-green-400">{stats.totalCompleted}</span>
                </div>
                <div className="h-8 w-px bg-indigo-600"></div>
                <div className="text-center">
                  <span className="block text-xs text-indigo-300">المتبقي</span>
                  <span className="text-2xl font-bold text-white">{totalRequired - stats.totalCompleted}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        <div className="md:hidden bg-indigo-800 rounded-xl p-4 text-white flex justify-between items-center">
           <div>
             <span className="text-xs text-indigo-300 block">نسبة الإنجاز</span>
             <span className="text-2xl font-bold text-green-400">{progressPercentage}%</span>
           </div>
           <div className="w-1/2 bg-indigo-900 h-2 rounded-full overflow-hidden">
              <div className="bg-green-400 h-full transition-all duration-1000" style={{width: `${progressPercentage}%`}}></div>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(CATEGORIES).map(([key, data]) => {
            const catStat = stats.catStats[key];
            const isComplete = catStat.completed >= data.req;
            return (
              <button 
                key={key}
                onClick={() => setActiveTab(key)}
                className={`p-3 rounded-xl border transition-all duration-200 text-right flex flex-col justify-between h-24
                  ${activeTab === key 
                    ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                  }`}>
                <span className={`text-xs font-bold truncate ${activeTab === key ? 'text-indigo-800' : 'text-gray-600'}`}>
                  {data.title}
                </span>
                <div className="flex justify-between items-end mt-1">
                   <span className={`text-xl font-bold ${isComplete ? 'text-green-600' : 'text-gray-800'}`}>
                     {catStat.completed} <span className="text-[10px] text-gray-400 font-normal">/ {data.req}</span>
                   </span>
                   {isComplete && <CheckCircle size={16} className="text-green-500" />}
                </div>
                <div className="w-full bg-gray-100 h-1 rounded-full mt-2 overflow-hidden">
                   <div 
                      className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`} 
                      style={{ width: `${Math.min(100, (catStat.completed / data.req) * 100)}%` }}
                   ></div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <div className="relative w-full md:w-1/2">
             <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input 
               type="text" 
               placeholder="ابحث عن اسم المادة أو رقمها..." 
               className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           
           <div className="flex gap-2 w-full md:w-auto">
             <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 md:flex-none
                ${activeTab === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
               الكل
             </button>
             <button 
                onClick={resetProgress}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none"
             >
               <RefreshCw size={16} /> إعادة تعيين
             </button>
           </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500 w-16">الحالة</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500">اسم المادة</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500 w-24">الساعات</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500 w-32 hidden md:table-cell">المتطلب السابق</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500 w-24">تحليل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr 
                      key={course.id} 
                      className={`group transition-colors hover:bg-indigo-50 
                        ${course.completed ? 'bg-indigo-50/30' : ''}`}
                    >
                      <td className="px-6 py-4 cursor-pointer" onClick={() => toggleCourse(course.id)}>
                        <button 
                          className={`transition-all duration-200 
                            ${course.completed ? 'text-green-500 scale-110' : 'text-gray-300 group-hover:text-indigo-400'}`}
                        >
                          {course.completed ? <CheckCircle size={24} fill="currentColor" className="text-white" /> : <Circle size={24} />}
                        </button>
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => toggleCourse(course.id)}>
                        <div className="flex flex-col">
                          <span className={`font-medium text-base ${course.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                            {course.name}
                          </span>
                          <span className="text-xs text-gray-400 font-mono mt-0.5">{course.id}</span>
                          <span className="text-xs text-orange-400 md:hidden mt-1">
                             سابق: {course.prereq}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                           <BookOpen size={14} className="text-gray-400" />
                           {course.hours}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell" dir="ltr">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{course.prereq}</span>
                      </td>
                      <td className="px-6 py-4">
                         <button 
                            onClick={(e) => { e.stopPropagation(); setInsightCourse(course); }}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                            title="تحليل ذكي للمادة"
                         >
                            <Sparkles size={16} />
                         </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      لا توجد مواد تطابق بحثك أو التصنيف المختار.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <footer className="text-center text-gray-400 text-sm py-6">
          <p>مخطط الطالب الجامعي - تخصص علم الحاسوب (مدعوم بالذكاء الاصطناعي)</p>
        </footer>

      </main>

      {showAdvisor && <AdvisorChat courses={courses} onClose={() => setShowAdvisor(false)} />}
      {insightCourse && <InsightModal course={insightCourse} onClose={() => setInsightCourse(null)} />}

    </div>
  );
};

export default App;
