import React, { useState } from 'react';
import { AppStep, ChatMessage } from './types';
import StepWizard from './components/StepWizard';
import ResultView from './components/ResultView';
import { initializeAndGenerate, continueGeneration } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SCRIPT_INPUT);
  const [script, setScript] = useState('');
  const [template, setTemplate] = useState('');
  const [theme, setTheme] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Wizard Steps
  const handleStepNext = async (data: string) => {
    setError(null);

    if (step === AppStep.SCRIPT_INPUT) {
      setScript(data);
      setStep(AppStep.TEMPLATE_INPUT);
    } else if (step === AppStep.TEMPLATE_INPUT) {
      setTemplate(data);
      setStep(AppStep.THEME_INPUT);
    } else if (step === AppStep.THEME_INPUT) {
      setTheme(data);
      await startInitialGeneration(data);
    }
  };

  // Start the first generation
  const startInitialGeneration = async (themeInput: string) => {
    setStep(AppStep.PROCESSING);
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY || '';
      const responseText = await initializeAndGenerate(apiKey, themeInput, script, template);

      setHistory([
        { role: 'model', content: responseText }
      ]);
      setStep(AppStep.RESULT_AND_CONTINUE);
    } catch (err: any) {
      console.error(err);
      setError("Có lỗi xảy ra khi kết nối với Gemini. Vui lòng kiểm tra API Key hoặc thử lại.");
      setStep(AppStep.THEME_INPUT); // Go back one step to retry
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subsequent script chunks
  const handleContinue = async (newScriptChunk: string) => {
    // Optimistically add user message
    const userMsg: ChatMessage = { role: 'user', content: newScriptChunk };
    setHistory((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const responseText = await continueGeneration(newScriptChunk);
      setHistory((prev) => [...prev, { role: 'model', content: responseText }]);
    } catch (err: any) {
      console.error(err);
      setHistory((prev) => [...prev, { role: 'model', content: "Lỗi: Không thể tạo prompt cho đoạn này. Hãy thử lại.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Visual Script Prompter
                </h1>
            </div>
          {step > AppStep.THEME_INPUT && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
               <span className="px-2 py-1 bg-gray-800 rounded border border-gray-700">Theme: {theme}</span>
               <button 
                onClick={() => window.location.reload()}
                className="hover:text-red-400 transition-colors"
               >
                 Reset
               </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg flex items-center gap-3">
             <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             {error}
          </div>
        )}

        {(step === AppStep.SCRIPT_INPUT || step === AppStep.TEMPLATE_INPUT || step === AppStep.THEME_INPUT || step === AppStep.PROCESSING) && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <StepWizard 
              currentStep={step === AppStep.PROCESSING ? AppStep.THEME_INPUT : step} 
              onNext={handleStepNext} 
              isLoading={step === AppStep.PROCESSING}
            />
          </div>
        )}

        {step === AppStep.RESULT_AND_CONTINUE && (
          <ResultView 
            history={history} 
            onContinue={handleContinue} 
            isLoading={isLoading} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
