import React from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Key } from 'lucide-react';

export const Security = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold text-gradient-gold">Enterprise Security</h1>
                <p className="text-lg text-muted-foreground">
                    Strictly control cross-grid communication using Ingress/Egress rules.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-card/50 border-primary/10">
                    <CardContent className="pt-6">
                        <Shield className="h-6 w-6 text-primary mb-3" />
                        <h3 className="font-semibold mb-2">Ingress Rules</h3>
                        <p className="text-sm text-muted-foreground">
                            Define which external grids are allowed to <strong>command</strong> this grid.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-primary/10">
                    <CardContent className="pt-6">
                        <Lock className="h-6 w-6 text-primary mb-3" />
                        <h3 className="font-semibold mb-2">Egress Rules</h3>
                        <p className="text-sm text-muted-foreground">
                            Define where this grid is allowed to <strong>send data</strong>.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-primary/10">
                    <CardContent className="pt-6">
                        <Key className="h-6 w-6 text-primary mb-3" />
                        <h3 className="font-semibold mb-2">Permissions</h3>
                        <p className="text-sm text-muted-foreground">
                            Granular control: <code>READ</code>, <code>WRITE</code>, <code>EXECUTE</code>.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-display font-semibold">Configuration Example</h2>
                <div className="border border-primary/10 rounded-lg overflow-hidden">
                    <div className="bg-muted/50 p-4 border-b border-primary/10">
                        <span className="font-mono text-sm text-muted-foreground">Sensitive Grid Configuration</span>
                    </div>
                    <CodeBlock
                        code={`<FiboGrid
  gridId="payroll-grid"
  rowData={salaries}
  
  // Only allow Analytics Dashboard to read data
  ingress={[
    {
      origin: 'analytics-dashboard',
      permissions: ['READ'] 
    },
    // Allow HR Admin to do everything
    {
      origin: 'hr-admin-panel',
      permissions: ['*']
    }
  ]}

  // Prevent this grid from sending data anywhere except the vault
  egress={[
    {
       destiny: 'secure-vault',
       permissions: ['WRITE']
    }
  ]}
/>`}
                        className="m-0 border-none rounded-none"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-display font-semibold">Violation Handling</h2>
                <p className="text-muted-foreground">
                    If an unauthorized grid attempts to access this grid (e.g. via <code>useFiboGrid('payroll-grid')</code>), the request is rejected and a security violation is logged.
                </p>
            </div>
        </div>
    );
};
