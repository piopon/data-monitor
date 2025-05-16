import logo from "../assets/images/logo-64_outline.png"

const PageHeader = () => {
  return (
    <nav className="bg-indigo-600 border-b border-indigo-500">
        <div className="flex h-20 items-center justify-between mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <a className="flex flex-shrink-0 items-center mr-4" href="/">
                <img className="h-10 w-auto" src={logo} alt="Data Monitor" />
                <span className="hidden md:block text-white text-2xl font-bold ml-2">Data Monitor</span>
            </a>
        </div>
    </nav>
  )
}

export default PageHeader