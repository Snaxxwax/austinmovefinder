import React, { useState } from 'react';
import { CheckCircle, Clock, FileText, Lightbulb, Download, Printer } from 'lucide-react';
import { movingChecklist, austinMovingTips } from '../lib/utils';
import { SEOHead } from '../components/SEOHead';

export const MovingGuidePage: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const generateTaskId = (timeline: string, task: string) => {
    return `${timeline}-${task}`.replace(/\s+/g, '-').toLowerCase();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead 
        title="Complete Austin Moving Guide - Checklist & Tips | Austin Move Finder"
        description="Complete moving guide for Austin, TX. Free moving checklist, timeline, and Austin-specific tips for utilities, DMV, and local requirements."
        url="https://austinmovefinder.com/moving-guide"
        keywords={['Austin moving guide', 'moving to Austin checklist', 'Austin moving tips', 'Texas moving requirements', 'Austin utilities']}
      />
      
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Complete Austin Moving Guide
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your step-by-step guide to moving to Austin, Texas. From planning to settling in, 
          we've got everything you need for a smooth relocation.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <button 
          onClick={() => window.print()}
          className="bg-austin-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-austin-teal transition-colors inline-flex items-center justify-center no-print"
        >
          <Printer className="mr-2 h-5 w-5" />
          Printer Checklist
        </button>
        <button className="border-2 border-austin-blue text-austin-blue px-6 py-3 rounded-lg font-semibold hover:bg-austin-blue hover:text-white transition-colors inline-flex items-center justify-center no-print">
          <Download className="mr-2 h-5 w-5" />
          Download PDF
        </button>
      </div>

      {/* Moving Timeline Checklist */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Moving Timeline Checklist
        </h2>
        
        <div className="space-y-8">
          {movingChecklist.map((section) => (
            <div key={section.timeline} className="austin-card p-6 moving-checklist">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-austin-blue mr-3" />
                <h3 className="font-heading text-xl font-bold text-gray-900">
                  {section.timeline}
                </h3>
              </div>
              
              <div className="space-y-3">
                {section.tasks.map((task, taskIndex) => {
                  const taskId = generateTaskId(section.timeline, task);
                  const isCompleted = completedTasks.has(taskId);
                  
                  return (
                    <div 
                      key={taskIndex}
                      className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors no-print"
                      onClick={() => toggleTask(taskId)}
                    >
                      <div className={`mt-1 ${isCompleted ? 'text-austin-green' : 'text-gray-300'}`}>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <span className={`flex-1 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                        {task}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Austin-Specific Tips */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Austin-Specific Moving Tips
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {austinMovingTips.map((tip, index) => (
            <div key={index} className="moving-tip-card">
              <div className="flex items-start space-x-3 mb-3">
                <Lightbulb className="h-6 w-6 text-austin-green mt-1" />
                <h3 className="font-heading text-lg font-bold text-gray-900">
                  {tip.title}
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{tip.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Essential Austin Resources */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Essential Austin Resources
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="austin-card p-6">
            <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">
              <FileText className="inline h-6 w-6 text-austin-blue mr-2" />
              Government Services
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <a href="https://www.austintexas.gov/" className="text-austin-blue hover:underline">City of Austin Official Site</a></li>
              <li>• <a href="https://www.dps.texas.gov/" className="text-austin-blue hover:underline">Texas DPS (Driver's License)</a></li>
              <li>• <a href="https://www.traviscountytx.gov/" className="text-austin-blue hover:underline">Travis County Services</a></li>
              <li>• <a href="https://tax-office.traviscountytx.gov/" className="text-austin-blue hover:underline">Vehicle Registration</a></li>
            </ul>
          </div>
          
          <div className="austin-card p-6">
            <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">
              <Lightbulb className="inline h-6 w-6 text-austin-green mr-2" />
              Utilities & Services
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <a href="https://austinenergy.com/" className="text-austin-blue hover:underline">Austin Energy (Electricity)</a></li>
              <li>• <a href="https://www.austintexas.gov/department/austin-water" className="text-austin-blue hover:underline">Austin Water</a></li>
              <li>• <a href="https://www.texasgas.com/" className="text-austin-blue hover:underline">Texas Gas Service</a></li>
              <li>• <a href="https://www.austintexas.gov/department/austin-resource-recovery" className="text-austin-blue hover:underline">Waste Management</a></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Progress Tracking */}
      <section className="austin-card p-6 text-center no-print">
        <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">
          Your Moving Progress
        </h3>
        <div className="flex items-center justify-center space-x-4">
          <div className="text-2xl font-bold text-austin-blue">
            {completedTasks.size}
          </div>
          <div className="text-gray-600">
            tasks completed out of {movingChecklist.reduce((total, section) => total + section.tasks.length, 0)}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-austin-green h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(completedTasks.size / movingChecklist.reduce((total, section) => total + section.tasks.length, 0)) * 100}%`
            }}
          ></div>
        </div>
      </section>
    </div>
  );
};
