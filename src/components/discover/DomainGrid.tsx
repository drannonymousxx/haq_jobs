import React from 'react';
import styles from '@/styles/discover/Discover.module.css';
import { 
  Briefcase, Scale, Gavel, Receipt, ClipboardCheck, 
  Shield, Lock, Landmark, Handshake, Building, 
  Leaf, Users, AlertCircle, BookOpen, Globe,
  Swords, TrendingDown, Database, Tv, Cpu
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  "Corporate Law": Briefcase,
  "Litigation": Scale,
  "Arbitration": Gavel,
  "Tax Law": Receipt,
  "Compliance": ClipboardCheck,
  "IP Law": Shield,
  "Cyber Law": Lock,
  "Banking & Finance": Landmark,
  "Mergers & Acquisitions": Handshake,
  "Real Estate Law": Building,
  "Environmental Law": Leaf,
  "Labour Law": Users,
  "Criminal Law": AlertCircle,
  "Constitutional Law": BookOpen,
  "International Law": Globe,
  "Competition Law": Swords,
  "Insolvency Law": TrendingDown,
  "Data Privacy": Database,
  "Media Law": Tv,
  "Technology Law": Cpu
};

interface DomainGridProps {
  domains: string[];
}

export default function DomainGrid({ domains }: DomainGridProps) {
  return (
    <div className={styles.domainGrid}>
      {domains.map((domain, idx) => {
        const IconComponent = iconMap[domain] || Briefcase;
        return (
          <div key={idx} className={styles.domainPill}>
            <IconComponent size={16} />
            <span>{domain}</span>
          </div>
        );
      })}
    </div>
  );
}
