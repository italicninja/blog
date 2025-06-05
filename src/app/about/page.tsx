import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: 'About | Tech & Automation Stuff',
  description: 'A bit about me and what I do with computers and automation.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <header className="mb-16 text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">Hey There! 👋</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Just a tech nerd who loves automating boring stuff
              </p>
            </header>
            
            <div className="bg-background border border-gray-200 dark:border-gray-800 rounded-lg shadow-small overflow-hidden mb-16 p-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  I'm a Sysadmin who's obsessed with making computers do the boring work for us. I spend way too much time automating tasks that would probably take less time to do manually... but where's the fun in that?
                </p>

                <p>
                  I mess around with DevOps tools, Puppet, and all that infrastructure stuff. I've built some cool automation with Terraform and Puppet that saved my team from the mind-numbing task of setting up servers manually.
                </p>

                <p>
                  When I'm not glued to my terminal, I'm probably trying to convince my coworkers that we can automate just about anything. They're starting to hide from me when they see me coming with "another great idea."
                </p>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-medium tracking-tight text-foreground mb-6">Stuff I Play With</h3>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 text-accent">▹</span>
                    Terraform (because clicking in the AWS console is for chumps)
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 text-accent">▹</span>
                    Puppet & Ansible (making servers behave since 2011)
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 text-accent">▹</span>
                    CI/CD Pipelines (or as I call them, "robot assistants")
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 text-accent">▹</span>
                    Cloud stuff (AWS, Azure, GCP - all the acronyms)
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 text-accent">▹</span>
                    Docker & Kubernetes (containers all the way down)
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 text-accent">▹</span>
                    AI tools (teaching robots to watch other robots)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}