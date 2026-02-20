import { FC, useState } from 'react';
import Logo from '../components/Logo';
import Socials from '../components/Socials';
import NavBar from '../components/NavBar';
import { Link } from 'react-router-dom';
import EmailForm from '../components/EmailForm';

interface Category {
  documentId: number | string;
  name: string;
}

interface FooterProps {
  categories: Category[];
}

const Footer: FC<FooterProps> = ({ categories }) => {
  const [openForm, setOpenForm] = useState(false);

  const handleFormOpen = () => setOpenForm(true);
  const handleFormClose = () => setOpenForm(false);

  return (
    <footer className="bg-main2">
      <div className="container pt-4 pb-2 flex flex-col gap-4 text-white">
        <Logo
          className="lg:text-3xl md:text-2xl text-xl text-white w-fit"
          spanClassName="text-white"
          isLink
        />
        <div className="flex flex-col md:flex-row justify-between gap-y-4 md:gap-x-12">
          <div className="flex flex-col gap-2">
            <h4 className="section__description text-white font-merriweather font-semibold text-base">
              Categories
            </h4>
            <NavBar
              categories={categories}
              className="flex flex-col gap-y-0.5"
              textClassName="text-sm break-words text-white font-light opacity-90 hover:opacity-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="section__description text-white font-merriweather font-semibold text-base">
              About
            </h4>
            <div className="flex flex-col gap-1.5">
              <Link
                to="/privacy"
                className="section__description text-white font-light text-sm opacity-90 hover:opacity-100"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="section__description text-white font-light text-sm opacity-90 hover:opacity-100"
              >
                Terms
              </Link>
              <button
                className="border rounded px-1.5 py-1 text-xs w-fit opacity-90 hover:opacity-100 hover:bg-white hover:text-main2 transition-colors"
                onClick={handleFormOpen}
              >
                Contact us
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="section__description text-white font-merriweather font-semibold text-base">
              Follow us:
            </h4>
            <Socials
              textClassName="text-white font-light text-sm opacity-90 hover:opacity-100"
              IconsClassName="fill-white w-5 h-5"
            />
          </div>
        </div>
        <div className="flex flex-col mt-2">
          <hr className="w-full border-t border-white m-0 opacity-20" />
          <p className="section__description text-skin text-white py-2 font-light text-[10px] opacity-70">
            @2025 Nice Advice. All rights reserved.
          </p>
        </div>
      </div>
      {openForm && <EmailForm handleFormClose={handleFormClose} />}
    </footer>
  );
};

export default Footer;
