export default function Footer() {
  return (
    <footer className="bg-[#F2F2F4] flex justify-between text-[#006497] text-center p-4">
      <p>
        &copy;{" "}
        {`${new Date().getFullYear()} InvoIQ Team. Todos los derechos reservados.`}
      </p>
      <p>Desarrollado por InvoIQ</p>
    </footer>
  );
}
