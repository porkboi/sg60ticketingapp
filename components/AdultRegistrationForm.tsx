import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdultRegistrationForm({
  index,
  formData,
  onChange,
  onNext,
  onPrev,
  isLast,
}: {
  index: number;
  formData: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isLast: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Adult {index + 1} Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input
            value={formData.firstName}
            onChange={e => onChange({ firstName: e.target.value })}
            placeholder="First Name"
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            value={formData.lastName}
            onChange={e => onChange({ lastName: e.target.value })}
            placeholder="Last Name"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            value={formData.email}
            onChange={e => onChange({ email: e.target.value })}
            placeholder="Email"
          />
        </div>
        <div>
          <Label>Contact Number</Label>
          <Input
            value={formData.contactNumber}
            onChange={e => onChange({ contactNumber: e.target.value })}
            placeholder="Contact Number"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {index > 0 && (
          <Button variant="outline" onClick={onPrev}>
            Previous
          </Button>
        )}
        <Button onClick={onNext}>{isLast ? "Finish" : "Next"}</Button>
      </div>
    </div>
  );
}