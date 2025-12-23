import React, { useState, useRef } from 'react';
import { AppStep } from '../types';

interface StepWizardProps {
  currentStep: AppStep;
  onNext: (data: string) => void;
  isLoading: boolean;
}

const StepWizard: React.FC<StepWizardProps> = ({ currentStep, onNext, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputValue(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleNext = () => {
    if (!inputValue.trim()) return;
    onNext(inputValue);
    setInputValue(''); // Reset for next step
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderContent = () => {
    switch (currentStep) {
      case AppStep.SCRIPT_INPUT:
        return {
          title: 'Bước 1: Script Nội Dung',
          instruction: 'Úp hoặc dán cho tôi file "Script Nội Dung" (Không chứa tiêu đề) của bạn.',
          placeholder: 'Dán nội dung script vào đây...',
          buttonText: 'Gửi Script',
        };
      case AppStep.TEMPLATE_INPUT:
        return {
          title: 'Bước 2: Prompt Visual Image',
          instruction: 'Ok. Tôi đã nhận được "Script Nội Dung". Tiếp theo hãy úp hoặc dán file "Prompt Visual Image" cho tôi.',
          placeholder: 'Dán nội dung template Visual Image vào đây...',
          buttonText: 'Gửi Template',
        };
      case AppStep.THEME_INPUT:
        return {
          title: 'Bước 3: Nhập Tiêu Đề',
          instruction: 'Ok. Tôi đã nhận được "Script Nội Dung" và "Prompt Visual Image". Tiếp theo hãy cho tôi biết tiêu đề "YYYYYYYYYY" để tôi điền vào phần [Theme: YYYYYYYYYY ].',
          placeholder: 'Nhập tiêu đề (Theme)...',
          buttonText: 'Bắt đầu Tạo Prompt',
          hideFile: true,
        };
      default:
        return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-white mb-2">{content.title}</h2>
      <p className="text-gray-300 mb-6">{content.instruction}</p>

      <div className="space-y-4">
        {!content.hideFile && (
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 hover:border-blue-500 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click để úp file</span> hoặc kéo thả</p>
                <p className="text-xs text-gray-500">File văn bản (.txt, .md)</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.md,.csv" />
            </label>
          </div>
        )}

        <div className="relative">
          <textarea
            className="w-full h-48 bg-gray-900 text-white border border-gray-700 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none scrollbar-thin scrollbar-thumb-gray-600"
            placeholder={content.placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          ></textarea>
        </div>

        <button
          onClick={handleNext}
          disabled={!inputValue.trim() || isLoading}
          className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all transform duration-200 ${
            !inputValue.trim() || isLoading
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 hover:shadow-lg active:scale-95'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            content.buttonText
          )}
        </button>
      </div>
    </div>
  );
};

export default StepWizard;
