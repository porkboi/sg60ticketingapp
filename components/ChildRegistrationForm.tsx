import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChildRegistrationForm({
  index,
  formData,
  onChange,
}: {
  index: number;
  formData: any;
  onChange: (data: any) => void;
}) {
  return (
    <div className="mb-4 p-4 border rounded bg-green-50">
      <h4 className="font-semibold mb-2">Child {index + 1} Information</h4>
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
          <Label>Contact Number</Label>
          <Input
            value={formData.contactNumber}
            onChange={e => onChange({ contactNumber: e.target.value })}
            placeholder="Contact Number"
          />
        </div>
      </div>
      {/* Occupation is autofilled as Student */}
    </div>
  );
}