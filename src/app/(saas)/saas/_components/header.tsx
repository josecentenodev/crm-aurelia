import React from 'react'
type SectionHeaderProps = {
    title: string;
    description: string;
    children?: React.ReactNode;
};
const SectionHeader = ({ title, description, children }: SectionHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-600">{description}</p>
            </div>
            {children}
        </div>
    )
}

export { SectionHeader }