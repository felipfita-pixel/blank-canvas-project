import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Globe, 
  Search, 
  FileText, 
  Settings, 
  BarChart, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Save,
  Link as LinkIcon,
  Twitter,
  Facebook,
  Smartphone,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { SeoConfig, PageSeo } from "@/types/seo";

const SeoManager = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  
  const [globalConfig, setGlobalConfig] = useState<SeoConfig>({
    domain: "corretoresrj.com",
    global_title: "Corretores Associados & FF | Imóveis Barra da Tijuca, Recreio e Zona Sul RJ",
    global_description: "Especialistas em imóveis prontos e lançamentos na Barra da Tijuca, Recreio, Ilha Pura, Península e Zona Sul do Rio de Janeiro.",
    canonical_url: "https://www.corretoresrj.com",
    robots: "index, follow",
    twitter_card: "summary_large_image",
    google_analytics_id: "G-XXXXXXXXXX",
    google_search_console_id: "verification-code-here",
    robots_txt: "User-agent: *\nAllow: /\nSitemap: https://www.corretoresrj.com/sitemap.xml",
  });

  const [pagesSeo, setPagesSeo] = useState<PageSeo[]>([
    { path: "/", title: "Home | Corretores RJ", description: "Encontre os melhores imóveis na Barra da Tijuca e região.", keywords: "imóveis rj, barra da tijuca, recreio" },
    { path: "/imoveis", title: "Imóveis à Venda | Corretores RJ", description: "Confira nossa lista completa de imóveis disponíveis.", keywords: "apartamentos à venda, casas rj" },
    { path: "/contato", title: "Contato | Corretores RJ", description: "Entre em contato com nossos especialistas.", keywords: "corretor de imóveis, imobiliária rj" },
  ]);

  const handleSaveGlobal = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Configurações globais salvas com sucesso!");
    }, 1000);
  };

  const calculateSeoScore = () => {
    let score = 85;
    if (!globalConfig.google_analytics_id?.startsWith("G-")) score -= 10;
    if (globalConfig.global_description.length < 120) score -= 5;
    return score;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display">SEO Manager</h1>
          <p className="text-muted-foreground">Gerencie o SEO do corretoresrj.com de forma profissional.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 py-1 px-3">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Sitemap Ativo
          </Badge>
          <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/5 py-1 px-3">
            Score: {calculateSeoScore()}/100
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="global" className="gap-2">
            <Globe className="w-4 h-4" /> Global
          </TabsTrigger>
          <TabsTrigger value="pages" className="gap-2">
            <FileText className="w-4 h-4" /> Páginas
          </TabsTrigger>
          <TabsTrigger value="tools" className="gap-2">
            <Settings className="w-4 h-4" /> Ferramentas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart className="w-4 h-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Pontuação SEO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-emerald-500">{calculateSeoScore()}</span>
                  <span className="text-muted-foreground pb-1">/100</span>
                </div>
                <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${calculateSeoScore()}%` }} 
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Indexação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold">142</span>
                  <span className="text-muted-foreground pb-1">Páginas</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Sitemap processado pelo Google há 2 dias.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-orange-500">3</span>
                  <span className="text-muted-foreground pb-1">Pendências</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-[10px] text-orange-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Meta Title duplicado em 2 páginas
                  </div>
                  <div className="text-[10px] text-orange-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> GA4 não configurado corretamente
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Visão Geral do Google Search</CardTitle>
              <CardDescription>Como seu site aparece nos resultados de busca.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-[#f8f9fa] dark:bg-[#202124] p-6 rounded-xl border border-border max-w-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-white dark:bg-[#303134] rounded-full border border-border flex items-center justify-center text-[10px] font-bold text-blue-500">
                    C
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#202124] dark:text-[#bdc1c6] font-medium leading-none">Corretores RJ</span>
                    <span className="text-[10px] text-[#4d5156] dark:text-[#9aa0a6] leading-tight">https://www.corretoresrj.com</span>
                  </div>
                </div>
                <h3 className="text-[#1a0dab] dark:text-[#8ab4f8] text-xl font-medium hover:underline cursor-pointer mb-1">
                  {globalConfig.global_title}
                </h3>
                <p className="text-[#4d5156] dark:text-[#bdc1c6] text-sm leading-snug">
                  {globalConfig.global_description}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Globais</CardTitle>
              <CardDescription>Defina os padrões de SEO para todo o site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domínio Principal</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="domain" 
                      value={globalConfig.domain} 
                      onChange={(e) => setGlobalConfig({...globalConfig, domain: e.target.value})}
                    />
                    <Button variant="outline" size="icon"><LinkIcon className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="robots">Indexação (Robots)</Label>
                  <Input 
                    id="robots" 
                    value={globalConfig.robots} 
                    onChange={(e) => setGlobalConfig({...globalConfig, robots: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="global_title">Meta Title Global (Padrão)</Label>
                <Input 
                  id="global_title" 
                  value={globalConfig.global_title} 
                  onChange={(e) => setGlobalConfig({...globalConfig, global_title: e.target.value})}
                />
                <p className="text-[10px] text-muted-foreground text-right">{globalConfig.global_title.length} / 60 caracteres recomendados</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="global_desc">Meta Description Global</Label>
                <Textarea 
                  id="global_desc" 
                  rows={3}
                  value={globalConfig.global_description} 
                  onChange={(e) => setGlobalConfig({...globalConfig, global_description: e.target.value})}
                />
                <p className="text-[10px] text-muted-foreground text-right">{globalConfig.global_description.length} / 160 caracteres recomendados</p>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-600" /> Open Graph (Facebook)
                  </h3>
                  <div className="space-y-2">
                    <Label className="text-xs">OG Image URL</Label>
                    <Input placeholder="URL da imagem para compartilhamento" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-sky-500" /> Twitter Cards
                  </h3>
                  <div className="space-y-2">
                    <Label className="text-xs">Twitter Card Type</Label>
                    <Input value={globalConfig.twitter_card} readOnly />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveGlobal} disabled={loading} className="bg-secondary text-secondary-foreground">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>SEO por Página</CardTitle>
                <CardDescription>Otimize títulos e descrições individuais.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Search className="w-4 h-4" /> Escanear Site
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pagesSeo.map((page, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border hover:border-secondary/40 transition-colors bg-card/50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{page.path}</Badge>
                        <h4 className="font-medium">{page.title}</h4>
                      </div>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{page.description}</p>
                    <div className="mt-2 flex gap-2">
                      {page.keywords?.split(",").map((kw, j) => (
                        <span key={j} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {kw.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Robots.txt</CardTitle>
                <CardDescription>Controle o acesso dos rastreadores.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  rows={5} 
                  className="font-mono text-xs" 
                  value={globalConfig.robots_txt} 
                  onChange={(e) => setGlobalConfig({...globalConfig, robots_txt: e.target.value})}
                />
                <Button variant="outline" size="sm" className="w-full">Atualizar Robots.txt</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sitemap XML</CardTitle>
                <CardDescription>Ajude o Google a encontrar suas páginas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded border border-border flex items-center justify-between">
                  <code className="text-[10px]">/sitemap.xml</code>
                  <Badge className="bg-emerald-500">Ativo</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" /> Visualizar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Save className="w-4 h-4" /> Gerar Novo
                  </Button>
                </div>
                <Alert className="bg-blue-500/5 border-blue-500/20 py-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <AlertDescription className="text-[10px] text-blue-700 dark:text-blue-300">
                    Sitemap é atualizado automaticamente ao cadastrar novos imóveis.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Integrações Google</CardTitle>
              <CardDescription>Conecte as ferramentas oficiais de SEO e Analytics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs">Google Analytics (GA4)</Label>
                  <Input 
                    placeholder="G-XXXXXXXXXX" 
                    value={globalConfig.google_analytics_id}
                    onChange={(e) => setGlobalConfig({...globalConfig, google_analytics_id: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Search Console ID</Label>
                  <Input 
                    placeholder="Código de verificação" 
                    value={globalConfig.google_search_console_id}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Google Tag Manager</Label>
                  <Input placeholder="GTM-XXXXXXX" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm">Verificar Integrações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <BarChart className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle>Relatórios de Tráfego Orgânico</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-2">
              Conecte sua conta do Google Search Console para visualizar cliques, impressões e CTR diretamente aqui.
            </CardDescription>
            <Button className="mt-6 bg-secondary text-secondary-foreground">Conectar Google Account</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeoManager;
