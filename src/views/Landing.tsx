import Button from '../components/Button';
import Corgi from '../components/Corgi';
import Footer from '../components/Footer';

interface LandingProps {
  onStart: () => void;
}

function Landing({ onStart }: LandingProps) {
  return (
    <>
      <div className="w-full text-center">
        <div className="relative flex flex-col justify-center items-center w-full lg:flex-row lg:place-items-center px-5 z-100">
          <div className="relative h-full ml-0 mr-0 text-xl">
            <div className="px-3 py-2.5 mb-23">
              <div className="sr-only flex items-center -mt-1 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to Resume Corgi!</h1>
              </div>
              <h2 className="text-gray-950 mb-5 dark:text-gray-50 font-bold text-3xl w-full lg:w-3/4 mx-auto">
                Let's build a beautiful resume that showcases your talent.
              </h2>
              <p className="text-gray-950 mb-5 dark:text-gray-50 text-sm w-full lg:w-2/5 mx-auto">
                It's free, optimized for scanning software,
                and secure. Your data never leaves your device.
              </p>
              <Button onClick={onStart} text="Start Building" className="px-5 py-2" />
              <div className="ml-2.5 relative inline-block p-[3px] rounded-3xl ai-gradient-border">
                <button className="px-4.5 py-2 bg-gray-900 rounded-[22px] text-gray-200 
                              text-s font-medium cursor-pointer transition-all duration-200 
                              flex items-center gap-2 hover:bg-gray-800">
                  <span>✨</span>
                  Build with AI Mode
                </button>
              </div>
            </div>
          </div>
          
          <div className="hidden /lg:block mt-4 lg:mt-0 lg:me-auto">
            <Corgi size={172} />
          </div>
        </div>

        <Footer className="absolute bottom-[1rem] lg:bottom-[1rem] left-0 right-0" />
      </div>
    </>
  );
}

export default Landing;