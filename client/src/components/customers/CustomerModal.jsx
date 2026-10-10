import Modal from "../ui/Modal";
import CustomerForm from "./CustomerForm";

export default function CustomerModal({
  open,
  onClose,
  onSubmit,
  customer,
}) {
  return (
    <Modal
      open={open}
      title={
        customer
          ? "Edit Customer"
          : "Add Customer"
      }
      onClose={onClose}
    >
      <CustomerForm
        initialData={customer}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}