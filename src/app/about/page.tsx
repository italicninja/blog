import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: 'About | Tech Stuff',
  description: 'A bit about me and what I do with computers and automation.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Hey There! 👋</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Just a tech nerd who loves automating boring stuff
              </p>
            </header>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-12">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="md:w-1/3">
                  <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
                    <Image
                      src="/vercel.svg"
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex justify-center space-x-4 mb-6">
                    <a href="https://github.com/italicninja" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      <span className="sr-only">GitHub</span>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
                      </svg>
                    </a>
                    <a href="https://www.linkedin.com/in/ianc485/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="md:w-2/3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Professional Background</h2>

                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    I'm Ian, A Technology Architect/Sysadmin who's obsessed with making computers do the boring work for us. I spend way too much time automating tasks that would probably take less time to do manually... but where's the fun in that?
                  </p>

                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    I mess around with DevOps tools, Puppet, and all that infrastructure stuff. I've built some cool automation with Terraform and Puppet that saved my team from the mind-numbing task of setting up servers manually.
                  </p>

                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    When I'm not glued to my terminal, I'm probably trying to convince my coworkers that we can automate just about anything. They're starting to hide from me when they see me coming with "another great idea."
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Stuff I Play With</h3>

                  <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300 space-y-2">
                    <li>Terraform (because clicking in the AWS console is for chumps)</li>
                    <li>Puppet & Ansible (making servers behave since 2011)</li>
                    <li>CI/CD Pipelines (or as I call them, "robot assistants")</li>
                    <li>Cloud stuff (AWS, Azure, GCP - all the acronyms)</li>
                    <li>Docker & Kubernetes (containers all the way down)</li>
                    <li>AI tools (teaching robots to watch other robots)</li>
                    <li>Monitoring (because I like sleeping through the night)</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8">About This Blog</h3>

                  <p className="text-gray-600 dark:text-gray-300">
                    This is where I dump my brain about automation, DevOps, and how AI is making our tech lives easier. Nothing too fancy - just stuff I've learned, mistakes I've made, and cool tricks I've picked up along the way. If it helps you automate something boring, my work here is done!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}