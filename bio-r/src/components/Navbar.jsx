import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaInfoCircle, 
  FaEnvelope, 
  FaUser, 
  FaSignInAlt, 
  FaSignOutAlt, 
  FaUserCircle, 
  FaCog, 
  FaChevronDown,
  FaBook,
  FaLeaf
} from "react-icons/fa";

const NavbarContainer = styled.nav`
  background: linear-gradient(135deg, #2d5a27, #1b4332);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Logo = styled(Link)`
  color: #a7f3d0;
  font-size: 2rem;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #4ade80;
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.8rem;
  }
`;

const MenuIcon = styled.div`
  display: none;
  color: #4caf50;
  font-size: 1.8rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const NavMenu = styled.ul`
  list-style: none;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    position: absolute;
    top: 60px;
    left: 0;
    background: #1a2e35;
    height: ${({ isOpen }) => (isOpen ? "100vh" : "0")};
    transition: height 0.3s ease;
    overflow: hidden;
  }
`;

const NavItem = styled.li`
  margin: 0 0.5rem;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    margin: 0.8rem 0;
    width: 100%;
  }
`;

const NavLink = styled(Link)`
  color: #a7f3d0;
  text-decoration: none;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #4ade80;
    background: rgba(167, 243, 208, 0.1);
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    font-size: 1.3rem;
    padding: 0.8rem 1.2rem;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #81c784;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.3s ease;

  &:hover {
    color: #4caf50;
    transform: translateY(-3px);
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  color: #81c784;
  font-size: 1.2rem;
  margin-right: 1rem;
  position: relative;
  cursor: pointer;

  @media (max-width: 768px) {
    margin: 1.5rem 0;
    font-size: 1.5rem;
  }
`;

const UserIcon = styled(FaUserCircle)`
  margin-right: 0.5rem;
  color: #4caf50;
`;

const UserSubmenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: #1a2e35;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  padding: 0.5rem 0;
  width: 200px;
  z-index: 1001;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const SubmenuItem = styled.div`
  padding: 0.8rem 1rem;
  color: #81c784;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2c4a52;
    color: #4caf50;
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSubmenu = (e) => {
    e.stopPropagation();
    setIsSubmenuOpen(!isSubmenuOpen);
  };

  // Cerrar el submenú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = () => {
      if (isSubmenuOpen) {
        setIsSubmenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSubmenuOpen]);

  return (
    <NavbarContainer>
      <Logo to="/">
        <FaLeaf /> BioScan
      </Logo>
      <MenuIcon onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </MenuIcon>
      <NavMenu isOpen={isOpen}>
        <NavItem>
          <NavLink to="/">
            <FaHome /> Inicio
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/about">
            <FaInfoCircle /> Sobre Nosotros
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/mi-coleccion">
            <FaBook /> Mi Biblioteca
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/contact">
            <FaEnvelope /> Contacto
          </NavLink>
        </NavItem>
        {!user ? (
          <>
            <NavItem>
              <NavLink to="/login">
                <FaSignInAlt /> Iniciar Sesión
              </NavLink>
            </NavItem>
          </>
        ) : (
          <NavItem>
            <UserInfo onClick={toggleSubmenu}>
              <UserIcon /> 
              {user.email}
              <FaChevronDown style={{ marginLeft: '8px' }} />
              <UserSubmenu isOpen={isSubmenuOpen}>
                <SubmenuItem as={Link} to="/profile">
                  <FaUser /> Mi Perfil
                </SubmenuItem>
                <SubmenuItem as={Link} to="/mi-coleccion">
                  <FaBook /> Mi Biblioteca
                </SubmenuItem>
                <SubmenuItem as={Link} to="/albumes">
                  <FaBook /> Mis Álbumes
                </SubmenuItem>
                <SubmenuItem onClick={onLogout}>
                  <FaSignOutAlt /> Cerrar Sesión
                </SubmenuItem>
              </UserSubmenu>
            </UserInfo>
          </NavItem>
        )}
      </NavMenu>
    </NavbarContainer>
  );
};

export default Navbar;