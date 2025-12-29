"use client";
import Link from "next/link";
import { useState } from "react";
type NavbarProps = {
readonly links: readonly { readonly name: string; readonly href: 
string }[];
};
export default function Navbar({ links }: NavbarProps) {
const [isOpen, setIsOpen] = useState(false);
return (
<nav className="bg-blue-600 text-white shadow-md">
<div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-
center">
<Link href="/" className="text-2xl font-bold">
MonSite
</Link>
{/* Menu Desktop */}
<div className="hidden md:flex space-x-6 items-center">
{links.map((link) => (
<Link key={link.href} href={link.href} className="hover:text-gray-200"> 
{link.name}
</Link>
))}
{/* 🔹 Lien vers la page de connexion */}
<Link
href="/login"
className="bg-white text-blue-600 px-4 py-1 rounded font-semibold hover:bg-gray-100 transition" 
>
Connexion
</Link>
</div>
{/* Bouton menu mobile */}
<button
className="md:hidden text-white text-2xl" 
onClick={() => setIsOpen(!isOpen)}
aria-label="Menu mobile"
>
☰
</button>
</div>
{/* Menu mobile */}
{isOpen && (
<div className="md:hidden bg-blue-500 px-4 pb-4 space-y-2"> 
{links.map((link) => (
<Link
key={link.href}
href={link.href}
className="block"
onClick={() => setIsOpen(false)}
>
{link.name}
</Link>
))}
{/* 🔹 Lien Connexion aussi sur mobile */}
<Link
href="/login"
className="block bg-white text-blue-600 px-3 py-1 rounded text-
center font-semibold"
onClick={() => setIsOpen(false)}
>
Connexion
</Link>
</div>
)}
</nav>
);
}