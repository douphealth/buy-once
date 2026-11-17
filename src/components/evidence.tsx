import { useState } from "react";
import { ExternalLink, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { name, type Device, type Fact } from "@/lib/research";

export function Evidence({ device, fact }: { device: Device; fact?: Fact }) {
  const [open, setOpen] = useState(false);
  return <>
    <Button variant="link" className="h-auto px-0 text-xs" onClick={() => setOpen(true)} aria-label={`View evidence for ${name(device)}${fact ? `: ${fact.label}` : ""}`}><FileSearch />View evidence</Button>
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader><SheetTitle className="font-display text-3xl">{name(device)}</SheetTitle><SheetDescription>{fact?.label ?? "Documentation record"} · {device.market}</SheetDescription></SheetHeader>
        <p className="eyebrow mt-8 text-primary">Imported documentation summary</p>
        <p className="mt-3">{fact?.detail ?? device.without_plan}</p>
        <dl className="mt-6 space-y-4 text-sm"><div><dt className="font-medium">Record review date</dt><dd>{device.reviewed} (from the supplied dataset; not reverified today)</dd></div><div><dt className="font-medium">Claim-level verification</dt><dd className="text-muted-foreground">Not available. These links were supplied for the device, not individually mapped to this claim. No verbatim supporting excerpt or named reviewer was supplied.</dd></div></dl>
        <h3 className="mt-6 font-medium">Manufacturer links in this record</h3>
        <ul className="mt-3 space-y-3">{device.source_urls.map((url, i) => <li key={url}><a href={url} target="_blank" rel="noreferrer" className="flex items-start gap-2 break-all text-sm text-primary underline">{i + 1}. {url}<ExternalLink className="mt-1 size-3 shrink-0" /></a></li>)}</ul>
        <h3 className="mt-6 font-medium">Limitations</h3><p className="mt-2 text-sm text-muted-foreground">{device.limitations}</p>
        <p className="mt-6 border-t pt-4 text-sm">No device was physically tested. Some linked pages use other regions; US applicability has not been independently reconfirmed.</p>
      </SheetContent>
    </Sheet>
  </>;
}