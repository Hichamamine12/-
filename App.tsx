import React, { useEffect, useState, useRef } from 'react';
import { Calculator, Calendar, AlertTriangle, Scale, CheckCircle, Info, Clock, RefreshCw, Upload, FileText, ScanLine, X, PenTool, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { arMA } from 'date-fns/locale';
import { GoogleGenAI } from "@google/genai";
import { TaxType } from './types';
import { calculatePrescription, fileToBase64 } from './utils';

// Components defined in the same file for simplicity as per instructions
const Header = () => (
  <header className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white p-6 shadow-lg">
    <div className="container mx-auto max-w-5xl flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
          <Scale className="w-8 h-8 text-emerald-100" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المحرك المغربي للتقادم الضريبي</h1>
          <p className="text-emerald-100 text-sm mt-1 opacity-90">حساب الآجال القانونية وفق المدونة العامة للضرائب</p>
        </div>
      </div>
      <div className="hidden md:block text-left text-xs text-emerald-200">
        <p>الإصدار 1.0.0</p>
        <p>القانون 47-06 & CGI</p>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-slate-900 text-slate-400 py-8 mt-12 border-t border-slate-800">
    <div className="container mx-auto max-w-5xl text-center">
      <p className="text-sm">هذا التطبيق أداة استرشادية ولا يعوض الاستشارة القانونية الرسمية.</p>
      <p className="text-xs mt-2 opacity-60">© {new Date().getFullYear()} نظام الحساب الضريبي المغربي</p>
    </div>
  </footer>
);

const ResultCard = ({ result, loading, onDraftResponse }: { result: any, loading: boolean, onDraftResponse: () => void }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 h-full flex flex-col items-center justify-center min-h-[400px] border border-slate-100">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">جاري معالجة القواعد...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 h-full flex flex-col items-center justify-center min-h-[400px] border border-slate-100 text-center">
        <Calculator className="w-16 h-16 text-slate-200 mb-4" />
        <h3 className="text-lg font-bold text-slate-700 mb-2">أدخل البيانات للحساب</h3>
        <p className="text-slate-500 max-w-xs">قم بتحديد نوع الضريبة والتواريخ المرتبطة بها لعرض حالة التقادم والتفاصيل القانونية.</p>
      </div>
    );
  }

  const isExpired = result.status === 'EXPIRED';
  const statusColor = isExpired ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  const statusIcon = isExpired ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />;
  
  // Calculate percentage for progress bar
  const totalDuration = result.endDate.getTime() - result.startDate.getTime();
  const elapsed = new Date().getTime() - result.startDate.getTime();
  const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col h-full animate-fade-in">
      {/* Status Banner */}
      <div className={`p-6 border-b ${statusColor} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {statusIcon}
          <div>
            <h2 className="text-xl font-bold">{isExpired ? 'الضريبة متقادمة' : 'الضريبة سارية المفعول'}</h2>
            <p className="text-sm opacity-90">{isExpired ? 'انتهت الفترة القانونية للتحصيل' : 'لا تزال الإدارة تملك حق التحصيل'}</p>
          </div>
        </div>
        <div className="text-center bg-white/50 rounded-lg p-2 px-4 backdrop-blur-sm">
          <span className="block text-2xl font-bold">{result.prescriptionYears}</span>
          <span className="text-xs font-medium">سنوات</span>
        </div>
      </div>

      <div className="p-6 space-y-8 flex-grow">
        
        {/* Dates Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" />
              تاريخ البدء
            </span>
            <p className="text-lg font-bold text-slate-800">
              {format(result.startDate, 'dd MMMM yyyy', { locale: arMA })}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden">
             {isExpired && <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />}
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" />
              تاريخ التقادم (النهاية)
            </span>
            <p className={`text-lg font-bold ${isExpired ? 'text-red-600' : 'text-emerald-700'}`}>
              {format(result.endDate, 'dd MMMM yyyy', { locale: arMA })}
            </p>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div>
          <div className="flex justify-between text-sm mb-2 font-medium text-slate-600">
             <span>البداية</span>
             <span>اليوم</span>
             <span>النهاية</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${isExpired ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between items-center text-xs">
             <span className="text-slate-400">
                {format(result.startDate, 'yyyy/MM/dd')}
             </span>
             <span className={`font-bold px-2 py-1 rounded-full ${isExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isExpired 
                  ? `مضى ${result.daysExpired} يوم على التقادم` 
                  : `متبقي ${result.daysRemaining} يوم`}
             </span>
             <span className="text-slate-400">
                {format(result.endDate, 'yyyy/MM/dd')}
             </span>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            التفاصيل القانونية
          </h4>
          
          <div className="flex gap-3 text-sm group">
            <div className="min-w-[4px] bg-slate-200 rounded-full group-hover:bg-emerald-400 transition-colors"></div>
            <div>
              <span className="text-slate-500 block text-xs mb-0.5">الأساس القانوني</span>
              <p className="font-medium text-slate-800">{result.legalBasis}</p>
            </div>
          </div>

          {result.specialNotes && (
            <div className="flex gap-3 text-sm group">
              <div className="min-w-[4px] bg-slate-200 rounded-full group-hover:bg-blue-400 transition-colors"></div>
              <div>
                <span className="text-slate-500 block text-xs mb-0.5">ملاحظات خاصة</span>
                <p className="font-medium text-slate-700 leading-relaxed">{result.specialNotes}</p>
              </div>
            </div>
          )}

          {result.isException && (
            <div className="flex gap-3 text-sm mt-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
              <div className="min-w-[4px] bg-orange-400 rounded-full"></div>
              <div>
                <span className="text-orange-700 block text-xs font-bold mb-0.5">تنبيه استثنائي</span>
                <p className="font-medium text-orange-900 text-xs">
                  تم تطبيق قاعدة استثنائية (غش / حذف دخول) مما أدى إلى تمديد فترة التقادم.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100">
          <button 
            onClick={onDraftResponse}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <PenTool className="w-5 h-5" />
            صياغة رد إداري / تظلم
          </button>
        </div>
      </div>
    </div>
  );
};

// Types for Response Generator Props
interface ResponseGeneratorProps {
  taxType: TaxType;
  noticeDate: string;
  isExpired: boolean;
  prescriptionYears: number;
  taxpayerName: string;
  setTaxpayerName: (val: string) => void;
  taxpayerId: string;
  setTaxpayerId: (val: string) => void;
  referenceNumber: string;
  setReferenceNumber: (val: string) => void;
}

// Response Generator Component
const ResponseGenerator = ({ 
  taxType, 
  noticeDate, 
  isExpired,
  prescriptionYears,
  taxpayerName,
  setTaxpayerName,
  taxpayerId,
  setTaxpayerId,
  referenceNumber,
  setReferenceNumber
}: ResponseGeneratorProps) => {
  const [responseType, setResponseType] = useState(isExpired ? 'prescription' : 'review');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update response type default when props change
  useEffect(() => {
    if (isExpired) setResponseType('prescription');
  }, [isExpired]);

  const generateLetter = async () => {
    if (!taxpayerName || !referenceNumber) {
      setError('المرجو ملء اسم الملزم ورقم المرجع');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        بصفتك خبير ضرائب مغربي، اكتب رسالة رسمية (باللغة العربية الفصحى) موجهة إلى المدير الإقليمي للضرائب.
        
        بيانات الملف:
        - الموضوع: ${responseType === 'prescription' ? 'طلب سقوط الضريبة بالتقادم (Prescription)' : responseType === 'review' ? 'طلب مراجعة وعرض المعلومات' : 'طلب صلح ودي'}
        - الملزم: ${taxpayerName}
        - التعريف الضريبي/الوطني: ${taxpayerId}
        - نوع الضريبة: ${taxType}
        - رقم المرجع/المقال: ${referenceNumber}
        - تاريخ الإشعار: ${noticeDate}
        - حالة التقادم: ${isExpired ? 'متقادمة قانوناً' : 'سارية'}
        - مدة التقادم القانونية: ${prescriptionYears} سنوات

        التوجيهات:
        1. ابدأ بالبسملة والتحية الرسمية.
        2. اذكر الموضوع ورقم المرجع بوضوح.
        3. ${responseType === 'prescription' ? 'ركز الحجة القانونية على انقضاء الأجل القانوني (التقادم) طبقاً للمدونة العامة للضرائب (المادة 232 أو القوانين ذات الصلة)، وطالب بإلغاء الرسوم.' : ''}
        4. ${responseType === 'review' ? 'طالب بتوضيح الأسس المعتمدة في الفرض الضريبي واطلب مراجعة المبلغ نظراً لعدم مطابقته للواقع.' : ''}
        5. اختم بعبارات التقدير والاحترام وتوقيع الملزم.
        6. اجعل الأسلوب قانونياً، مهذباً، ومختصراً.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      setGeneratedLetter(response.text.trim());

    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء صياغة الرسالة. المرجو المحاولة مرة أخرى.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
          <PenTool className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">صياغة الردود والمراسلات</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">نوع المراسلة</label>
            <select 
              value={responseType}
              onChange={(e) => setResponseType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
            >
              <option value="prescription">تمسك بالتقادم (طلب إلغاء)</option>
              <option value="review">منازعة / طلب مراجعة</option>
              <option value="conciliation">طلب صلح ودي</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">اسم الملزم / الشركة</label>
            <input 
              type="text" 
              value={taxpayerName}
              onChange={(e) => setTaxpayerName(e.target.value)}
              placeholder="مثال: شركة الأمل ش.م.م"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">رقم التعريف الضريبي / CIN</label>
            <input 
              type="text" 
              value={taxpayerId}
              onChange={(e) => setTaxpayerId(e.target.value)}
              placeholder="IF / ICE / CIN"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">رقم المرجع / المقال</label>
            <input 
              type="text" 
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="رقم الجدول أو الإشعار"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
            />
          </div>

          <div className="pt-2">
            <button 
              onClick={generateLetter}
              disabled={isGenerating}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                ${isGenerating 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'}`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  جاري الصياغة...
                </>
              ) : (
                <>
                  <PenTool className="w-5 h-5" />
                  إنشاء الرسالة
                </>
              )}
            </button>
          </div>
          
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Output */}
        <div className="relative">
          <label className="text-sm font-semibold text-slate-700 block mb-1">معاينة الرسالة</label>
          <div className="w-full h-[400px] p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto font-serif leading-8 text-slate-800 whitespace-pre-wrap relative group">
             {generatedLetter ? generatedLetter : <span className="text-slate-400 italic text-sm">ستظهر الرسالة المقترحة هنا بعد الإنشاء...</span>}
             
             {generatedLetter && (
               <button 
                 onClick={copyToClipboard}
                 className="absolute top-4 left-4 p-2 bg-white shadow-md rounded-lg text-slate-600 hover:text-emerald-600 border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                 title="نسخ النص"
               >
                 <Copy className="w-5 h-5" />
               </button>
             )}
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">هذه الرسالة مقترح أولي، يرجى مراجعتها وتعديلها قبل الإرسال.</p>
        </div>
      </div>
    </div>
  );
};

// File Upload and Analysis Component
const FileAnalyzer = ({ onAnalysisComplete }: { onAnalysisComplete: (data: any) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('المرجو تحميل ملف صورة أو PDF فقط');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = await fileToBase64(file);
      
      const prompt = `
            قم بتحليل صورة الإشعار الضريبي المغربي هذه واستخرج البيانات التالية بصيغة JSON فقط:
            1. taxType: نوع الضريبة. حاول مطابقته مع أحد هذه القيم بالضبط: 
               ["ضريبة الدخل", "ضريبة الشركات", "الضريبة على القيمة المضافة", "الضريبة العقارية", "ضريبة السكن", "الضريبة المهنية", "الرسم الحضري", "الرسم القروي", "ضريبة النظافة", "رسوم التسجيل", "رسوم الطابع", "الرسوم الجمركية", "اشتراكات الضمان الاجتماعي"].
               إذا لم تجد تطابق دقيق، استخدم "ضريبة أخرى".
            2. noticeDate: تاريخ الإشعار أو تاريخ الوضع أو تاريخ الجدول (YYYY-MM-DD).
            3. dueDate: تاريخ الاستحقاق أو تاريخ الأداء (YYYY-MM-DD). إذا لم يوجد، استخدم نفس تاريخ الإشعار.
            4. taxpayerName: اسم الملزم أو الشركة (Taxpayer Name) (إن وجد).
            5. taxpayerId: رقم التعريف الضريبي أو البطاقة الوطنية (IF, ICE, CIN) (إن وجد).
            6. referenceNumber: رقم الجدول أو المرجع أو المقال (Reference Number) (إن وجد).
            
            Return JSON only:
            {
              "taxType": "string",
              "noticeDate": "YYYY-MM-DD",
              "dueDate": "YYYY-MM-DD",
              "taxpayerName": "string",
              "taxpayerId": "string",
              "referenceNumber": "string"
            }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { text: prompt },
            { inlineData: { mimeType: file.type, data: base64Data } }
        ],
        config: { responseMimeType: 'application/json' }
      });

      const extractedData = JSON.parse(response.text);
      onAnalysisComplete(extractedData);

    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحليل الملف. المرجو المحاولة مرة أخرى أو إدخال البيانات يدوياً.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div 
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[300px]
          ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'}
          ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
        />

        {isAnalyzing ? (
          <>
            <RefreshCw className="w-16 h-16 text-emerald-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-800">جاري تحليل الوثيقة...</h3>
            <p className="text-slate-500 mt-2">يتم الآن استخراج البيانات باستخدام الذكاء الاصطناعي</p>
          </>
        ) : (
          <>
            <div className="bg-emerald-100 p-4 rounded-full mb-4">
              <Upload className="w-10 h-10 text-emerald-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">اسحب وثيقة الإشعار الضريبي هنا</h3>
            <p className="text-slate-500 mb-6">أو اضغط لاختيار ملف (صورة أو PDF)</p>
            <div className="flex gap-4 text-xs text-slate-400">
               <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> يدعم JPG, PNG</span>
               <span className="flex items-center gap-1"><ScanLine className="w-4 h-4" /> مسح تلقائي</span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <ScanLine className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          تنبيه: التحليل الآلي يعتمد على جودة الصورة. يرجى دائماً مراجعة البيانات المستخرجة في تبويب الحساب قبل الاعتماد على النتيجة.
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'analyzer' | 'response'>('calculator');
  
  const [taxType, setTaxType] = useState<TaxType>(TaxType.INCOME_TAX);
  const [noticeDate, setNoticeDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [hasFraud, setHasFraud] = useState(false);
  const [hasOmission, setHasOmission] = useState(false);
  
  // Shared state for response generator
  const [taxpayerName, setTaxpayerName] = useState('');
  const [taxpayerId, setTaxpayerId] = useState(''); // IF or CIN
  const [referenceNumber, setReferenceNumber] = useState('');
  
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Auto-calculate on change
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      try {
        const result = calculatePrescription(
          taxType,
          new Date(noticeDate),
          new Date(dueDate),
          hasFraud,
          hasOmission
        );
        setCalculationResult(result);
      } catch (e) {
        console.error(e);
      } finally {
        setIsCalculating(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [taxType, noticeDate, dueDate, hasFraud, hasOmission]);

  const handleAnalysisData = (data: any) => {
    if (data.taxType) {
      // Find matching enum value or default
      const matchedType = Object.values(TaxType).find(t => t === data.taxType) || TaxType.OTHER;
      setTaxType(matchedType);
    }
    if (data.noticeDate) setNoticeDate(data.noticeDate);
    if (data.dueDate) setDueDate(data.dueDate);
    
    // Set additional extracted data for response generator
    if (data.taxpayerName) setTaxpayerName(data.taxpayerName);
    if (data.taxpayerId) setTaxpayerId(data.taxpayerId);
    if (data.referenceNumber) setReferenceNumber(data.referenceNumber);
    
    // Switch to calculator tab to show results
    setActiveTab('calculator');
  };

  const handleDraftResponse = () => {
    setActiveTab('response');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-5xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Tabs & Inputs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tabs Navigation */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button
                onClick={() => setActiveTab('calculator')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all
                  ${activeTab === 'calculator' 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <Calculator className="w-4 h-4" />
                الحاسبة
              </button>
              <button
                onClick={() => setActiveTab('analyzer')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all
                  ${activeTab === 'analyzer' 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <ScanLine className="w-4 h-4" />
                تحليل
              </button>
              <button
                onClick={() => setActiveTab('response')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all
                  ${activeTab === 'response' 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <PenTool className="w-4 h-4" />
                الردود
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              
              {activeTab === 'calculator' && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
                      <Calculator className="w-5 h-5" />
                    </div>
                    بيانات الملف الضريبي
                  </h3>

                  <div className="space-y-6">
                    
                    {/* Tax Type Select */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 block">نوع الضريبة</label>
                      <div className="relative">
                        <select 
                          value={taxType}
                          onChange={(e) => setTaxType(e.target.value as TaxType)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none text-slate-700 font-medium"
                        >
                          {Object.values(TaxType).map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 block">تاريخ الإشعار الضريبي</label>
                        <div className="relative">
                           <input 
                            type="date" 
                            value={noticeDate}
                            onChange={(e) => setNoticeDate(e.target.value)}
                            className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 font-sans"
                          />
                          <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 block">تاريخ استحقاق الضريبة</label>
                        <div className="relative">
                           <input 
                            type="date" 
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 font-sans"
                          />
                          <Clock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">يتم احتساب التقادم بناءً على التاريخ الأحدث بين الإشعار والاستحقاق.</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 my-4"></div>

                    {/* Exceptions Switches */}
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-slate-700 block mb-3">حالات استثنائية</label>
                      
                      <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${hasFraud ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <div className="pt-0.5">
                          <input 
                            type="checkbox" 
                            checked={hasFraud}
                            onChange={(e) => {
                              setHasFraud(e.target.checked);
                              if (e.target.checked) setHasOmission(false);
                            }}
                            className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <span className={`block font-bold text-sm ${hasFraud ? 'text-red-800' : 'text-slate-700'}`}>وجود غش ضريبي</span>
                          <span className="text-xs text-slate-500">يمدد فترة التقادم إلى 10 سنوات</span>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${hasOmission ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <div className="pt-0.5">
                          <input 
                            type="checkbox" 
                            checked={hasOmission}
                            onChange={(e) => {
                              setHasOmission(e.target.checked);
                              if (e.target.checked) setHasFraud(false);
                            }}
                            className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <span className={`block font-bold text-sm ${hasOmission ? 'text-orange-800' : 'text-slate-700'}`}>حذف دخول / إخفاء</span>
                          <span className="text-xs text-slate-500">يمدد فترة التقادم إلى 6 سنوات</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'analyzer' && (
                <FileAnalyzer onAnalysisComplete={handleAnalysisData} />
              )}
              
              {activeTab === 'response' && (
                 <div className="text-center p-8 animate-fade-in">
                    <div className="inline-flex p-4 bg-emerald-100 rounded-full text-emerald-700 mb-4">
                       <PenTool className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">مولد الردود الذكي</h3>
                    <p className="text-slate-500">
                       استخدم النموذج في الجهة اليسرى (للشاشات الكبيرة) أو في الأسفل لصياغة رد رسمي بناءً على بياناتك.
                    </p>
                 </div>
              )}
            </div>

            {activeTab === 'calculator' && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  يعتمد هذا النظام على قواعد البيانات المحدثة لقانون المالية 2016 وما بعده، مع مراعاة القواعد الانتقالية لبعض الرسوم القديمة.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Results OR Response Generator (Switches based on tab) */}
          <div className="lg:col-span-7">
            {activeTab === 'response' ? (
               <ResponseGenerator 
                  taxType={taxType}
                  noticeDate={noticeDate}
                  isExpired={calculationResult?.status === 'EXPIRED'}
                  prescriptionYears={calculationResult?.prescriptionYears || 4}
                  taxpayerName={taxpayerName}
                  setTaxpayerName={setTaxpayerName}
                  taxpayerId={taxpayerId}
                  setTaxpayerId={setTaxpayerId}
                  referenceNumber={referenceNumber}
                  setReferenceNumber={setReferenceNumber}
               />
            ) : (
               <ResultCard 
                 result={calculationResult} 
                 loading={isCalculating} 
                 onDraftResponse={handleDraftResponse}
               />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default App;